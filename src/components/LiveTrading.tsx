import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketTicker } from "@/hooks/useMarketData";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

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
const MIN_OPEN_TRADES = 3;

export const LiveTrading = () => {
  const { t } = useTranslation();
  const { data: tickerData } = useMarketTicker();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioPoint[]>([
    { time: new Date().toLocaleTimeString(), balance: INITIAL_CAPITAL }
  ]);
  const [currentBalance, setCurrentBalance] = useState(INITIAL_CAPITAL);

  // Initialize with 3 open trades on first load
  useEffect(() => {
    if (!tickerData || !Array.isArray(tickerData) || trades.length > 0) return;
    
    const initialTrades: Trade[] = [];
    for (let i = 0; i < MIN_OPEN_TRADES; i++) {
      const symbol = TRADING_SYMBOLS[i % TRADING_SYMBOLS.length];
      const ticker = tickerData.find((t: any) => t.symbol === symbol);
      
      if (ticker) {
        const direction = Math.random() > 0.5 ? 'long' : 'short';
        const price = parseFloat(ticker.lastPrice);
        const size = (INITIAL_CAPITAL * 0.1) + (Math.random() * INITIAL_CAPITAL * 0.05);
        
        initialTrades.push({
          id: `trade_${Date.now()}_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 60000), // Stagger timestamps
          asset: symbol.replace('USDT', ''),
          direction,
          entryPrice: price * (1 + (Math.random() - 0.5) * 0.01), // Slightly varied entry
          size,
          status: 'open'
        });
      }
    }
    
    setTrades(initialTrades);
  }, [tickerData]);

  // Update open positions with live PnL and manage trades
  useEffect(() => {
    if (!tickerData || !Array.isArray(tickerData)) return;

    const interval = setInterval(() => {
      const openCount = trades.filter(t => t.status === 'open').length;
      
      // Always maintain MIN_OPEN_TRADES
      if (openCount < MIN_OPEN_TRADES) {
        const symbol = TRADING_SYMBOLS[Math.floor(Math.random() * TRADING_SYMBOLS.length)];
        const ticker = tickerData.find((t: any) => t.symbol === symbol);
        
        if (ticker) {
          const direction = Math.random() > 0.5 ? 'long' : 'short';
          const price = parseFloat(ticker.lastPrice);
          const size = (currentBalance * 0.08) + (Math.random() * currentBalance * 0.07);
          
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
            
            // Close position logic: random chance or profit/loss thresholds
            const shouldClose = (Math.random() < 0.15 && openCount > MIN_OPEN_TRADES) || 
                              (trade.direction === 'long' && priceChange > 2.5) ||
                              (trade.direction === 'long' && priceChange < -2) ||
                              (trade.direction === 'short' && priceChange < -2.5) ||
                              (trade.direction === 'short' && priceChange > 2);

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
    }, 3000); // Update every 3 seconds for live feel

    return () => clearInterval(interval);
  }, [tickerData, trades, currentBalance]);

  const openPositions = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  // Calculate live PnL for open positions
  const livePnL = openPositions.reduce((acc, trade) => {
    if (!tickerData || !Array.isArray(tickerData)) return acc;
    const ticker = tickerData.find((t: any) => t.symbol === `${trade.asset}USDT`);
    if (!ticker) return acc;
    
    const currentPrice = parseFloat(ticker.lastPrice);
    const multiplier = trade.direction === 'long' ? 1 : -1;
    const pnl = (trade.size / trade.entryPrice) * (currentPrice - trade.entryPrice) * multiplier;
    return acc + pnl;
  }, 0);
  
  const totalPnL = (currentBalance - INITIAL_CAPITAL) + livePnL;
  const currentEquity = currentBalance + livePnL;
  const totalPnLPercent = ((totalPnL / INITIAL_CAPITAL) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('liveTrading.currentEquity')}</CardDescription>
            <CardTitle className="text-3xl font-bold">
              ${currentEquity.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {t('liveTrading.startingBalance')}: ${INITIAL_CAPITAL.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={totalPnL >= 0 ? "default" : "destructive"}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USD
                </Badge>
                <span className={`text-sm font-medium ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('liveTrading.openPositions')}</CardDescription>
            <CardTitle className="text-3xl font-bold">{openPositions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('liveTrading.activeTradesMonitored')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('liveTrading.totalTrades')}</CardDescription>
            <CardTitle className="text-3xl font-bold">{trades.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {closedTrades.length} {t('liveTrading.closed')}, {openPositions.length} {t('liveTrading.open')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('liveTrading.performanceChart')}</CardTitle>
          <CardDescription>{t('liveTrading.portfolioValue')}</CardDescription>
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
          <CardTitle>{t('liveTrading.tradeHistory')}</CardTitle>
          <CardDescription>{t('liveTrading.liveExecutionLog')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-2">{t('liveTrading.timeUtc')}</th>
                  <th className="pb-2">{t('liveTrading.asset')}</th>
                  <th className="pb-2">{t('liveTrading.direction')}</th>
                  <th className="pb-2">{t('liveTrading.entry')}</th>
                  <th className="pb-2">{t('liveTrading.exit')}</th>
                  <th className="pb-2">{t('liveTrading.pnl')} ($)</th>
                  <th className="pb-2">{t('liveTrading.pnl')} (%)</th>
                  <th className="pb-2">{t('liveTrading.status')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trades.slice(0, 15).map((trade) => {
                  let currentPnL = trade.pnl;
                  let currentPnLPercent = 0;
                  
                  // Calculate live PnL for open trades
                  if (trade.status === 'open' && tickerData && Array.isArray(tickerData)) {
                    const ticker = tickerData.find((t: any) => t.symbol === `${trade.asset}USDT`);
                    if (ticker) {
                      const currentPrice = parseFloat(ticker.lastPrice);
                      const multiplier = trade.direction === 'long' ? 1 : -1;
                      currentPnL = (trade.size / trade.entryPrice) * (currentPrice - trade.entryPrice) * multiplier;
                      currentPnLPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;
                    }
                  } else if (trade.pnl !== undefined && trade.exitPrice) {
                    const multiplier = trade.direction === 'long' ? 1 : -1;
                    currentPnLPercent = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;
                  }
                  
                  return (
                    <tr key={trade.id} className="border-b">
                      <td className="py-2">{trade.timestamp.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })}</td>
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
                      <td className={`py-2 font-medium ${
                        currentPnL === undefined ? '' : 
                        currentPnL >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {currentPnL !== undefined 
                          ? `${currentPnL >= 0 ? '+' : ''}$${currentPnL.toFixed(2)}`
                          : '-'
                        }
                      </td>
                      <td className={`py-2 font-medium ${
                        currentPnLPercent === 0 ? '' : 
                        currentPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {currentPnLPercent !== 0 
                          ? `${currentPnLPercent >= 0 ? '+' : ''}${currentPnLPercent.toFixed(2)}%`
                          : '-'
                        }
                      </td>
                      <td className="py-2">
                        <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
                          {trade.status}
                        </Badge>
                      </td>
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
