import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TRADING_PAIRS = ['BTC/USDT', 'SOL/USDT', 'ETH/USDT', 'BNB/USDT'];

const PAIR_TO_SYMBOL: Record<string, string> = {
  'BTC/USDT': 'BTC',
  'ETH/USDT': 'ETH',
  'SOL/USDT': 'SOL',
  'BNB/USDT': 'BNB'
};

async function getCoinGlassPrice(symbol: string): Promise<number> {
  const apiKey = Deno.env.get('COINGLASS_API_KEY');
  if (!apiKey) {
    throw new Error('COINGLASS_API_KEY not configured');
  }

  const response = await fetch(
    `https://open-api-v3.coinglass.com/api/futures/openInterest/chart?symbol=${symbol}&interval=0`,
    {
      headers: {
        'accept': 'application/json',
        'coinglassSecret': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGlass API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.success && data.data && data.data.priceList && data.data.priceList.length > 0) {
    const prices = data.data.priceList;
    return parseFloat(prices[prices.length - 1].price);
  }
  
  throw new Error('No price data available from CoinGlass');
}

function calculateRiskLevel(leverage: number, pnlPercent: number): string {
  if (leverage >= 8 || Math.abs(pnlPercent) > 15) return 'High';
  if (leverage >= 5 || Math.abs(pnlPercent) > 8) return 'Medium';
  return 'Low';
}

function formatHoldTime(entryTime: string): string {
  const duration = Date.now() - new Date(entryTime).getTime();
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json().catch(() => ({ action: 'update_prices' }));

    // Ensure trading_state row exists
    await ensureTradingState(supabase);

    // ACTION 1: Update prices and unrealized PnL for open positions
    if (action === 'update_prices') {
      const { data: openPositions } = await supabase
        .from('open_positions')
        .select('*');

      if (openPositions && openPositions.length > 0) {
        for (const position of openPositions) {
          try {
            const symbol = PAIR_TO_SYMBOL[position.pair];
            const currentPrice = await getCoinGlassPrice(symbol);
            
            // Calculate unrealized PnL
            const entryPrice = parseFloat(position.entry_price);
            const size = parseFloat(position.size);
            const leverage = position.leverage;
            
            const priceChange = position.side === 'LONG' 
              ? (currentPrice - entryPrice) / entryPrice
              : (entryPrice - currentPrice) / entryPrice;
            
            const unrealizedPnlPercent = priceChange * leverage * 100;
            const unrealizedPnl = (size * priceChange * leverage);
            
            const riskLevel = calculateRiskLevel(leverage, unrealizedPnlPercent);

            await supabase
              .from('open_positions')
              .update({
                current_price: currentPrice.toFixed(2),
                unrealized_pnl: unrealizedPnl.toFixed(2),
                unrealized_pnl_percent: unrealizedPnlPercent.toFixed(2),
                risk_level: riskLevel
              })
              .eq('id', position.id);

            console.log(`Updated ${position.pair} ${position.side}: PnL ${unrealizedPnl.toFixed(2)} (${unrealizedPnlPercent.toFixed(2)}%)`);
          } catch (error) {
            console.error(`Error updating position ${position.id}:`, error);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Prices updated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION 2: Close a position and open a new one
    if (action === 'close_and_open') {
      const { data: openPositions } = await supabase
        .from('open_positions')
        .select('*')
        .order('entry_time', { ascending: true })
        .limit(1);

      if (openPositions && openPositions.length > 0) {
        const positionToClose = openPositions[0];
        
        // Generate realistic realized PnL: -$15 to +$35, with 70% win rate
        const isWin = Math.random() < 0.7;
        const realizedPnl = isWin ? Math.random() * 35 : -(Math.random() * 15);
        const size = parseFloat(positionToClose.size);
        const realizedPnlPercent = (realizedPnl / size) * 100;
        
        // Calculate fees (0.1% - 0.3%)
        const fees = size * (0.001 + Math.random() * 0.002);
        
        // Determine close reason
        const closeReasons = ['TP', 'SL', 'MANUAL'];
        const closeReason = isWin ? closeReasons[Math.floor(Math.random() * 2)] : closeReasons[1]; // SL more likely on loss
        
        const holdTime = formatHoldTime(positionToClose.entry_time);

        // Get current balance
        const { data: currentState } = await supabase
          .from('trading_state')
          .select('*')
          .eq('id', 1)
          .single();

        const newBalance = parseFloat(currentState.current_balance) + realizedPnl - fees;

        // Update balance
        await supabase
          .from('trading_state')
          .update({
            current_balance: newBalance.toFixed(2),
            last_updated: new Date().toISOString()
          })
          .eq('id', 1);

        // Insert closed trade
        await supabase
          .from('closed_trades')
          .insert({
            close_time: new Date().toISOString(),
            pair: positionToClose.pair,
            side: positionToClose.side,
            size: positionToClose.size,
            leverage: positionToClose.leverage,
            realized_pnl: realizedPnl.toFixed(2),
            realized_pnl_percent: realizedPnlPercent.toFixed(2),
            close_reason: closeReason,
            hold_time: holdTime,
            fees: fees.toFixed(2)
          });

        // Insert close order event
        await supabase
          .from('orders')
          .insert({
            timestamp: new Date().toISOString(),
            pair: positionToClose.pair,
            action: 'CLOSE',
            side: positionToClose.side,
            size: positionToClose.size,
            leverage: positionToClose.leverage,
            status: 'FILLED'
          });

        // Delete from open positions
        await supabase
          .from('open_positions')
          .delete()
          .eq('id', positionToClose.id);

        // Insert equity history
        await supabase
          .from('equity_history')
          .insert({
            balance: newBalance.toFixed(2),
            timestamp: new Date().toISOString()
          });

        console.log(`Closed ${positionToClose.pair} ${positionToClose.side}: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)}`);

        // Wait 15-30 seconds before opening new position (simulated with immediate open)
        // In production, you'd schedule this separately
        await openNewPosition(supabase);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Position closed and new opened' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION 3: Open a new position (also used by close_and_open)
    if (action === 'open_position') {
      await openNewPosition(supabase);
      return new Response(
        JSON.stringify({ success: true, message: 'New position opened' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-trading-state:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function openNewPosition(supabase: any) {
  // Check current open positions count
  const { data: currentPositions } = await supabase
    .from('open_positions')
    .select('*');

  // Keep 1-3 positions open
  if (currentPositions && currentPositions.length >= 3) {
    console.log('Max positions reached, skipping new open');
    return;
  }

  // Select random pair
  const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
  const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
  const size = 100 + Math.random() * 200; // $100-$300
  const leverage = Math.floor(3 + Math.random() * 8); // 3x-10x
  const tpEnabled = Math.random() > 0.3; // 70% have TP
  const slEnabled = Math.random() > 0.2; // 80% have SL

  // Get current price
  const symbol = PAIR_TO_SYMBOL[pair];
  let entryPrice: number;
  
  try {
    entryPrice = await getCoinGlassPrice(symbol);
  } catch (error) {
    console.error('Failed to get price, using fallback');
    if (pair === 'BTC/USDT') entryPrice = 100000;
    else if (pair === 'ETH/USDT') entryPrice = 3500;
    else if (pair === 'SOL/USDT') entryPrice = 200;
    else entryPrice = 650;
  }

  // Insert open position
  await supabase
    .from('open_positions')
    .insert({
      pair,
      side,
      size: size.toFixed(2),
      leverage,
      entry_price: entryPrice.toFixed(2),
      current_price: entryPrice.toFixed(2),
      entry_time: new Date().toISOString(),
      unrealized_pnl: 0,
      unrealized_pnl_percent: 0,
      risk_level: 'Low',
      tp_enabled: tpEnabled,
      sl_enabled: slEnabled
    });

  // Insert order event
  await supabase
    .from('orders')
    .insert({
      timestamp: new Date().toISOString(),
      pair,
      action: 'OPEN',
      side,
      size: size.toFixed(2),
      leverage,
      status: 'FILLED'
    });

  console.log(`Opened ${pair} ${side} ${leverage}x: $${size.toFixed(2)}`);
}

async function ensureTradingState(supabase: any) {
  const { data: state } = await supabase
    .from('trading_state')
    .select('*')
    .eq('id', 1)
    .single();

  if (!state) {
    const starting = 1000;
    await supabase
      .from('trading_state')
      .insert({
        id: 1,
        starting_balance: starting.toFixed(2),
        current_balance: starting.toFixed(2),
        last_updated: new Date().toISOString()
      });

    await supabase
      .from('equity_history')
      .insert({
        balance: starting.toFixed(2),
        timestamp: new Date().toISOString()
      });
  }
}
