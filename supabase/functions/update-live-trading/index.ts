import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TRADING_PAIRS = ['BTC/USDT', 'SOL/USDT', 'ETH/USDT', 'BNB/USDT'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current state
    const { data: stateData, error: stateError } = await supabase
      .from('live_trading_state')
      .select('*')
      .limit(1)
      .single();

    if (stateError) throw stateError;

    const currentBalance = parseFloat(stateData.current_balance);

    // Generate random delta (-$15 to +$35, 70% positive bias)
    const isPositive = Math.random() < 0.7;
    const delta = isPositive
      ? Math.random() * 35 + 5 // $5 to $35
      : -(Math.random() * 15); // -$15 to $0

    const newBalance = currentBalance + delta;

    // Select random trading pair
    const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const size = 100 + Math.random() * 200; // $100-$300

    // Update balance
    const { error: updateError } = await supabase
      .from('live_trading_state')
      .update({
        current_balance: newBalance.toFixed(2),
        last_update: new Date().toISOString()
      })
      .eq('id', stateData.id);

    if (updateError) throw updateError;

    // Insert trade
    const { error: tradeError } = await supabase
      .from('live_trades')
      .insert({
        pair,
        side,
        size: size.toFixed(2),
        pnl: delta.toFixed(2),
        balance_after: newBalance.toFixed(2)
      });

    if (tradeError) throw tradeError;

    // Add to equity history
    const { error: equityError } = await supabase
      .from('live_equity_history')
      .insert({
        balance: newBalance.toFixed(2)
      });

    if (equityError) throw equityError;

    console.log(`Trade executed: ${side} ${pair} | PnL: $${delta.toFixed(2)} | New Balance: $${newBalance.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        balance: newBalance.toFixed(2),
        delta: delta.toFixed(2),
        trade: { pair, side, size: size.toFixed(2) }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating trading state:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
