import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketTicker } from "@/hooks/useMarketData";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Trade {
  id: string;
  timestamp: Date;
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl?: number;
  status: 'open' | 'closed';
}

interface PortfolioPoint {
  time: string;
  balance: number;
}

const INITIAL_CAPITAL = 1000;
const TRADING_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export const LiveTrading = () => {
  const { data: tickerData } = useMarketTicker();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioPoint[]>([
    { time: new Date().toLocaleTimeString(), balance: INITIAL_CAPITAL }
  ]);
  const [currentBalance, setCurrentBalance] = useState(INITIAL_CAPITAL);

  useEffect(() => {
    if (!tickerData || !Array.isArray(tickerData)) return;

    const interval = setInterval(() => {
      // 30% chance to open a new trade
      if (Math.random() < 0.3 && trades.filter(t => t.status === 'open').length < 3) {
        const symbol = TRADING_SYMBOLS[Math.floor(Math.random() * TRADING_SYMBOLS.length)];
        const ticker = tickerData.find((t: any) => t.symbol === symbol);
        
        if (ticker) {
          const direction = Math.random() > 0.5 ? 'long' : 'short';
          const price = parseFloat(ticker.lastPrice);
          const maxSize = currentBalance * 0.15; // Max 15% of balance per trade
          const size = Math.random() * maxSize + maxSize * 0.3;
          
          const newTrade: Trade = {
            id: `trade_${Date.now()}`,
            timestamp: new Date(),
            asset: symbol.replace('USDT', ''),
            direction,
            entryPrice: price,
            size,
            status: 'open'
          };
          
          setTrades(prev => [newTrade, ...prev]);
        }
      }

      // Check if we should close any open trades
      setTrades(prev => {
        const updated = prev.map(trade => {
          if (trade.status === 'open') {
            const ticker = tickerData.find((t: any) => t.symbol === `${trade.asset}USDT`);
            if (!ticker) return trade;

            const currentPrice = parseFloat(ticker.lastPrice);
            const priceChange = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
            
            // Close position with 20% chance or if profit > 2% or loss > 1.5%
            const shouldClose = Math.random() < 0.2 || 
                              (trade.direction === 'long' && priceChange > 2) ||
                              (trade.direction === 'long' && priceChange < -1.5) ||
                              (trade.direction === 'short' && priceChange < -2) ||
                              (trade.direction === 'short' && priceChange > 1.5);

            if (shouldClose) {
              const multiplier = trade.direction === 'long' ? 1 : -1;
              const pnl = (trade.size / trade.entryPrice) * (currentPrice - trade.entryPrice) * multiplier;
              
              setCurrentBalance(prev => prev + pnl);
              setPortfolioHistory(prev => [...prev, {
                time: new Date().toLocaleTimeString(),
                balance: currentBalance + pnl
              }].slice(-20));

              return {
                ...trade,
                exitPrice: currentPrice,
                pnl,
                status: 'closed' as const
              };
            }
          }
          return trade;
        });
        return updated;
      });
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [tickerData, trades, currentBalance]);

  const openPositions = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  const totalPnL = currentBalance - INITIAL_CAPITAL;
  const totalPnLPercent = ((totalPnL / INITIAL_CAPITAL) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Portfolio Value</CardDescription>
            <CardTitle className="text-3xl font-bold">
              ${currentBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={totalPnL >= 0 ? "default" : "destructive"}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USD
              </Badge>
              <span className={`text-sm ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Positions</CardDescription>
            <CardTitle className="text-3xl font-bold">{openPositions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active trades being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-3xl font-bold">{trades.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {closedTrades.length} closed, {openPositions.length} open
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[900, 'auto']} />
              <Tooltip />
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

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Live execution log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Asset</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Exit</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">PNL</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trades.slice(0, 15).map((trade) => (
                  <tr key={trade.id} className="border-b">
                    <td className="py-2">{trade.timestamp.toLocaleTimeString()}</td>
                    <td className="py-2 font-medium">{trade.asset}</td>
                    <td className="py-2">
                      <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2">${trade.entryPrice.toFixed(2)}</td>
                    <td className="py-2">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2">${trade.size.toFixed(2)}</td>
                    <td className={`py-2 font-medium ${
                      trade.pnl === undefined ? '' : 
                      trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {trade.pnl !== undefined 
                        ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`
                        : '-'
                      }
                    </td>
                    <td className="py-2">
                      <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
                        {trade.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
