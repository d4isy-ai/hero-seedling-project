import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketTicker } from "@/hooks/useMarketData";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Trade {
  id: string;
  timestamp: string;
  pair: string;
  side: 'BUY' | 'SELL';
  size: string;
  pnl: string;
  balance_after: string;
}

interface TradingState {
  current_balance: string;
  starting_balance: string;
  last_update: string;
}

interface EquityPoint {
  timestamp: string;
  balance: number;
}

export const GlobalLiveTrading = () => {
  const { data: tickerData } = useMarketTicker();
  const [tradingState, setTradingState] = useState<TradingState | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [equityHistory, setEquityHistory] = useState<EquityPoint[]>([]);
  const [activePair, setActivePair] = useState('BTCUSDT');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: state } = await (supabase as any)
        .from('live_trading_state')
        .select('*')
        .limit(1)
        .single();

      if (state) setTradingState(state as TradingState);

      const { data: tradesData } = await (supabase as any)
        .from('live_trades')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (tradesData) setTrades(tradesData as Trade[]);

      const { data: equityData } = await (supabase as any)
        .from('live_equity_history')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(50);

      if (equityData) {
        setEquityHistory((equityData as any[]).map((e: any) => ({
          timestamp: new Date(e.timestamp).toLocaleTimeString(),
          balance: parseFloat(e.balance)
        })));
      }
    };

    fetchInitialData();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const stateChannel = supabase
      .channel('live_trading_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_trading_state'
        },
        (payload) => {
          if (payload.new) {
            setTradingState(payload.new as TradingState);
          }
        }
      )
      .subscribe();

    const tradesChannel = supabase
      .channel('live_trades_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_trades'
        },
        (payload) => {
          if (payload.new) {
            setTrades(prev => [payload.new as Trade, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    const equityChannel = supabase
      .channel('live_equity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_equity_history'
        },
        (payload) => {
          if (payload.new) {
            const newPoint = {
              timestamp: new Date(payload.new.timestamp).toLocaleTimeString(),
              balance: parseFloat(payload.new.balance)
            };
            setEquityHistory(prev => [...prev, newPoint].slice(-50));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stateChannel);
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(equityChannel);
    };
  }, []);

  // Rotate active pair every 5 seconds for visual variety
  useEffect(() => {
    const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
    const interval = setInterval(() => {
      setActivePair(pairs[Math.floor(Math.random() * pairs.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!tradingState) {
    return <div className="text-center py-8">Loading live trading data...</div>;
  }

  const currentBalance = parseFloat(tradingState.current_balance);
  const startingBalance = parseFloat(tradingState.starting_balance);
  const totalPnL = currentBalance - startingBalance;
  const totalPnLPercent = ((totalPnL / startingBalance) * 100).toFixed(2);

  // Get active ticker for price display
  const activeTicker = Array.isArray(tickerData) 
    ? tickerData.find((t: any) => t.symbol === activePair)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Lovable — Live Trading</h2>
        <p className="text-muted-foreground">Globally synchronized autonomous trading</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className={`text-4xl font-bold transition-colors duration-500 ${
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              ${currentBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">
              Starting Balance: ${startingBalance.toFixed(2)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={totalPnL >= 0 ? "default" : "destructive"}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </Badge>
              <span className={`text-sm font-medium ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardDescription>Active Pair</CardDescription>
            <CardTitle className="text-2xl font-bold">{activePair.replace('USDT', '/USDT')}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTicker && (
              <div className="space-y-1">
                <div className="text-2xl font-mono">
                  ${parseFloat(activeTicker.lastPrice).toFixed(2)}
                </div>
                <div className={`text-sm ${
                  parseFloat(activeTicker.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {parseFloat(activeTicker.priceChangePercent) >= 0 ? '+' : ''}
                  {parseFloat(activeTicker.priceChangePercent).toFixed(2)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-4xl font-bold">{trades.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Globally synchronized across all users
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={equityHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[950, 'auto']} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Live Trade Feed</CardTitle>
          <CardDescription>Recent executions across all pairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-2">Time (UTC)</th>
                  <th className="pb-2">Pair</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">PnL</th>
                  <th className="pb-2">Balance After</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trades.map((trade) => {
                  const pnl = parseFloat(trade.pnl);
                  return (
                    <tr key={trade.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-mono text-xs">
                        {new Date(trade.timestamp).toLocaleTimeString('en-US', { 
                          timeZone: 'UTC', 
                          hour12: false 
                        })}
                      </td>
                      <td className="py-3 font-medium">{trade.pair}</td>
                      <td className="py-3">
                        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                          {trade.side}
                        </Badge>
                      </td>
                      <td className="py-3 font-mono">${parseFloat(trade.size).toFixed(2)}</td>
                      <td className={`py-3 font-medium ${
                        pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </td>
                      <td className="py-3 font-mono">${parseFloat(trade.balance_after).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
