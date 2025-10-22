import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCoinGlassData } from "@/hooks/useCoinGlassData";
import { useMarketTicker } from "@/hooks/useMarketData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Signal {
  symbol: string;
  score: number;
  label: string;
  funding: number;
  oiChange: number;
  longShortRatio: number;
  liquidation: number;
  rationale: string;
}

interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  lastPrice: number;
  quantity: number;
  sizeUSD: number;
  pnlUSD: number;
  pnlPercent: number;
  status: "OPEN" | "CLOSED";
  exitPrice?: number;
  holdTime?: number;
  exitReason?: string;
}

interface EquityPoint {
  timestamp: number;
  equity: number;
}

// Top traded coins for the simulation
const SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "MATIC", "DOT", "LINK"];
const STARTING_BALANCE = 1000;
const MIN_TRADE_SIZE = 10;
const MAX_TRADE_SIZE = 20;
const MAX_POSITIONS = 3;
const TP_PERCENT = 1.2;
const SL_PERCENT = 0.8;
const TIME_EXIT_MS = 6 * 60 * 1000; // 6 minutes

export const DaisySimulation = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [equityHistory, setEquityHistory] = useState<EquityPoint[]>([
    { timestamp: Date.now(), equity: STARTING_BALANCE }
  ]);

  // Fetch market data
  const { data: tickerData } = useMarketTicker();
  
  // Fetch Coinglass data for each symbol - must be at top level
  const btcOI = useCoinGlassData("BTC", "openInterest");
  const btcFunding = useCoinGlassData("BTC", "fundingRate");
  const btcLS = useCoinGlassData("BTC", "longShortRatio");
  const btcLiq = useCoinGlassData("BTC", "liquidation");

  const ethOI = useCoinGlassData("ETH", "openInterest");
  const ethFunding = useCoinGlassData("ETH", "fundingRate");
  const ethLS = useCoinGlassData("ETH", "longShortRatio");
  const ethLiq = useCoinGlassData("ETH", "liquidation");

  const bnbOI = useCoinGlassData("BNB", "openInterest");
  const bnbFunding = useCoinGlassData("BNB", "fundingRate");
  const bnbLS = useCoinGlassData("BNB", "longShortRatio");
  const bnbLiq = useCoinGlassData("BNB", "liquidation");

  const solOI = useCoinGlassData("SOL", "openInterest");
  const solFunding = useCoinGlassData("SOL", "fundingRate");
  const solLS = useCoinGlassData("SOL", "longShortRatio");
  const solLiq = useCoinGlassData("SOL", "liquidation");

  const xrpOI = useCoinGlassData("XRP", "openInterest");
  const xrpFunding = useCoinGlassData("XRP", "fundingRate");
  const xrpLS = useCoinGlassData("XRP", "longShortRatio");
  const xrpLiq = useCoinGlassData("XRP", "liquidation");

  const adaOI = useCoinGlassData("ADA", "openInterest");
  const adaFunding = useCoinGlassData("ADA", "fundingRate");
  const adaLS = useCoinGlassData("ADA", "longShortRatio");
  const adaLiq = useCoinGlassData("ADA", "liquidation");

  const dogeOI = useCoinGlassData("DOGE", "openInterest");
  const dogeFunding = useCoinGlassData("DOGE", "fundingRate");
  const dogeLS = useCoinGlassData("DOGE", "longShortRatio");
  const dogeLiq = useCoinGlassData("DOGE", "liquidation");

  const maticOI = useCoinGlassData("MATIC", "openInterest");
  const maticFunding = useCoinGlassData("MATIC", "fundingRate");
  const maticLS = useCoinGlassData("MATIC", "longShortRatio");
  const maticLiq = useCoinGlassData("MATIC", "liquidation");

  const dotOI = useCoinGlassData("DOT", "openInterest");
  const dotFunding = useCoinGlassData("DOT", "fundingRate");
  const dotLS = useCoinGlassData("DOT", "longShortRatio");
  const dotLiq = useCoinGlassData("DOT", "liquidation");

  const linkOI = useCoinGlassData("LINK", "openInterest");
  const linkFunding = useCoinGlassData("LINK", "fundingRate");
  const linkLS = useCoinGlassData("LINK", "longShortRatio");
  const linkLiq = useCoinGlassData("LINK", "liquidation");

  // Calculate composite signal
  const calculateSignal = (
    symbol: string,
    funding: number,
    oiChange: number,
    lsRatio: number,
    liquidation: number
  ): Signal => {
    let score = 0;
    
    // Funding rate: favor mean reversion if extreme
    if (funding > 0.05) score -= 0.3;
    else if (funding < -0.05) score += 0.3;
    else score += 0.1;

    // OI change: positive growth with rising price → bullish
    if (oiChange > 3) score += 0.3;
    else if (oiChange < -3) score -= 0.3;

    // Long/Short ratio: contrarian when extreme
    if (lsRatio > 1.8) score -= 0.3;
    else if (lsRatio < 0.6) score += 0.3;

    // Liquidation: higher liquidation → more volatility
    if (liquidation > 1000000000) score += 0.1;

    // Clamp to [-1, 1]
    score = Math.max(-1, Math.min(1, score));

    let label = "Neutral";
    if (score >= 0.3) label = "Bullish";
    else if (score <= -0.3) label = "Bearish";

    // Generate detailed trader-friendly rationale
    let rationale = "";
    const parts: string[] = [];
    
    // Open Interest analysis
    if (oiChange > 3) {
      parts.push(`🔥 Strong capital inflow: Open Interest surged ${oiChange.toFixed(1)}% indicating fresh positioning and conviction`);
    } else if (oiChange > 1) {
      parts.push(`📈 Moderate OI increase (+${oiChange.toFixed(1)}%) shows growing market participation`);
    } else if (oiChange < -3) {
      parts.push(`⚠️ Heavy position unwinding: OI dropped ${oiChange.toFixed(1)}% suggesting traders are exiting`);
    } else if (oiChange < -1) {
      parts.push(`📉 Declining OI (${oiChange.toFixed(1)}%) indicates reduced market interest`);
    }

    // Funding rate analysis
    if (funding > 0.05) {
      parts.push(`🔴 Extremely high funding rate (${(funding * 100).toFixed(3)}%) - longs paying heavily, potential mean reversion setup`);
    } else if (funding > 0.03) {
      parts.push(`🟡 Elevated funding (${(funding * 100).toFixed(3)}%) - market may be overheated on long side`);
    } else if (funding < -0.05) {
      parts.push(`🟢 Deeply negative funding (${(funding * 100).toFixed(3)}%) - shorts paying premium, bullish contrarian signal`);
    } else if (funding < -0.03) {
      parts.push(`🟢 Negative funding (${(funding * 100).toFixed(3)}%) - short squeeze potential building`);
    } else if (Math.abs(funding) < 0.01) {
      parts.push(`⚪ Balanced funding (${(funding * 100).toFixed(3)}%) - neutral sentiment, no funding pressure`);
    }

    // Long/Short ratio analysis
    if (lsRatio > 1.8) {
      parts.push(`⚡ Crowded long (L/S: ${lsRatio.toFixed(2)}) - contrarian short opportunity, potential liquidation cascade risk`);
    } else if (lsRatio > 1.3) {
      parts.push(`📊 Long-biased market (L/S: ${lsRatio.toFixed(2)}) - watch for reversal signals`);
    } else if (lsRatio < 0.6) {
      parts.push(`⚡ Extreme short positioning (L/S: ${lsRatio.toFixed(2)}) - contrarian long setup, squeeze potential`);
    } else if (lsRatio < 0.8) {
      parts.push(`📊 Short-biased (L/S: ${lsRatio.toFixed(2)}) - bullish contrarian lean`);
    } else {
      parts.push(`⚖️ Balanced positioning (L/S: ${lsRatio.toFixed(2)}) - no clear directional bias`);
    }

    // Liquidation context
    if (liquidation > 1000000000) {
      parts.push(`💥 High liquidation volume ($${(liquidation / 1000000).toFixed(0)}M) - elevated volatility expected`);
    }

    // Combine all parts
    if (parts.length > 0) {
      rationale = parts.join(". ") + ".";
    } else {
      rationale = "Market showing neutral conditions with no extreme signals. Waiting for clearer directional setup.";
    }
    
    rationale += ` [Signal Score: ${score.toFixed(2)}]`;

    return { symbol, score, label, funding, oiChange, longShortRatio: lsRatio, liquidation, rationale };
  };

  // Update signals every 30s
  useEffect(() => {
    const updateSignals = () => {
      const newSignals: Signal[] = [];

      const symbolDataMap = {
        BTC: { oi: btcOI, funding: btcFunding, ls: btcLS, liq: btcLiq },
        ETH: { oi: ethOI, funding: ethFunding, ls: ethLS, liq: ethLiq },
        BNB: { oi: bnbOI, funding: bnbFunding, ls: bnbLS, liq: bnbLiq },
        SOL: { oi: solOI, funding: solFunding, ls: solLS, liq: solLiq },
        XRP: { oi: xrpOI, funding: xrpFunding, ls: xrpLS, liq: xrpLiq },
        ADA: { oi: adaOI, funding: adaFunding, ls: adaLS, liq: adaLiq },
        DOGE: { oi: dogeOI, funding: dogeFunding, ls: dogeLS, liq: dogeLiq },
        MATIC: { oi: maticOI, funding: maticFunding, ls: maticLS, liq: maticLiq },
        DOT: { oi: dotOI, funding: dotFunding, ls: dotLS, liq: dotLiq },
        LINK: { oi: linkOI, funding: linkFunding, ls: linkLS, liq: linkLiq },
      };

      SYMBOLS.forEach(symbol => {
        const data = symbolDataMap[symbol as keyof typeof symbolDataMap];
        if (data?.funding.data && data?.oi.data && data?.ls.data && data?.liq.data) {
          newSignals.push(calculateSignal(
            symbol,
            data.funding.data.data?.weightedFundingRate || 0,
            data.oi.data.data?.changePercent || 0,
            data.ls.data.data?.ratio || 1,
            data.liq.data.data?.totalLiquidation || 0
          ));
        }
      });

      if (newSignals.length > 0) {
        setSignals(newSignals);
        console.log('Updated signals:', newSignals);
      }
    };

    updateSignals();
    const interval = setInterval(updateSignals, 30000);
    return () => clearInterval(interval);
  }, [btcFunding.data, btcOI.data, btcLS.data, btcLiq.data, ethFunding.data, ethOI.data, ethLS.data, ethLiq.data, bnbFunding.data, bnbOI.data, bnbLS.data, bnbLiq.data, solFunding.data, solOI.data, solLS.data, solLiq.data, xrpFunding.data, xrpOI.data, xrpLS.data, xrpLiq.data, adaFunding.data, adaOI.data, adaLS.data, adaLiq.data, dogeFunding.data, dogeOI.data, dogeLS.data, dogeLiq.data, maticFunding.data, maticOI.data, maticLS.data, maticLiq.data, dotFunding.data, dotOI.data, dotLS.data, dotLiq.data, linkFunding.data, linkOI.data, linkLS.data, linkLiq.data]);

  // Get current price for symbol
  const getPrice = (symbol: string): number | null => {
    if (!tickerData || !Array.isArray(tickerData)) return null;
    const ticker = tickerData.find((t: any) => t.symbol === `${symbol}USDT`);
    return ticker ? parseFloat(ticker.lastPrice) : null;
  };

  // Update open trades PnL
  useEffect(() => {
    if (!tickerData) return;

    const updatedTrades = openTrades.map(trade => {
      const currentPrice = getPrice(trade.symbol);
      if (!currentPrice) return trade;

      const qty = trade.quantity;
      let pnlUSD = 0;
      if (trade.direction === "LONG") {
        pnlUSD = (currentPrice - trade.entryPrice) * qty;
      } else {
        pnlUSD = (trade.entryPrice - currentPrice) * qty;
      }
      const pnlPercent = (pnlUSD / trade.sizeUSD) * 100;

      return { ...trade, lastPrice: currentPrice, pnlUSD, pnlPercent };
    });

    setOpenTrades(updatedTrades);
  }, [tickerData]);

  // Check exits and entries every 3s
  useEffect(() => {
    const checkTradesInterval = setInterval(() => {
      const now = Date.now();
      
      // Check exits
      let stillOpen: Trade[] = [];
      const newClosed: Trade[] = [];

      openTrades.forEach(trade => {
        let shouldClose = false;
        let exitReason = "";

        // TP
        if (trade.pnlPercent >= TP_PERCENT) {
          shouldClose = true;
          exitReason = "TP";
        }
        // SL
        else if (trade.pnlPercent <= -SL_PERCENT) {
          shouldClose = true;
          exitReason = "SL";
        }
        // Time exit
        else if (now - trade.timestamp >= TIME_EXIT_MS) {
          shouldClose = true;
          exitReason = "Time";
        }

        if (shouldClose) {
          const closedTrade: Trade = {
            ...trade,
            status: "CLOSED",
            exitPrice: trade.lastPrice,
            holdTime: now - trade.timestamp,
            exitReason
          };
          newClosed.push(closedTrade);
          setRealizedPnL(prev => prev + trade.pnlUSD);
          console.log('Trade closed:', closedTrade);
        } else {
          stillOpen.push(trade);
        }
      });

      if (newClosed.length > 0) {
        setClosedTrades(prev => [...newClosed, ...prev]);
      }

      // Check entries - try to enter on every check if conditions are met
      if (stillOpen.length < MAX_POSITIONS && signals.length > 0) {
        // Sort signals by absolute score to prioritize strongest signals
        const sortedSignals = [...signals].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
        
        for (const signal of sortedSignals) {
          if (stillOpen.length >= MAX_POSITIONS) break;
          
          // Check if we already have a position in this symbol
          if (stillOpen.some(t => t.symbol === signal.symbol)) continue;
          
          const price = getPrice(signal.symbol);
          if (!price) continue;

          let shouldEnter = false;
          let direction: "LONG" | "SHORT" | null = null;

          if (signal.score >= 0.35) {
            shouldEnter = true;
            direction = "LONG";
          } else if (signal.score <= -0.35) {
            shouldEnter = true;
            direction = "SHORT";
          }

          if (shouldEnter && direction) {
            const sizeUSD = MIN_TRADE_SIZE + Math.random() * (MAX_TRADE_SIZE - MIN_TRADE_SIZE);
            const qty = sizeUSD / price;

            const newTrade: Trade = {
              id: `${signal.symbol}-${now}`,
              timestamp: now,
              symbol: signal.symbol,
              direction,
              entryPrice: price,
              lastPrice: price,
              quantity: qty,
              sizeUSD,
              pnlUSD: 0,
              pnlPercent: 0,
              status: "OPEN"
            };

            stillOpen.push(newTrade);
            console.log('Trade opened:', newTrade);
          }
        }
      }

      setOpenTrades(stillOpen);
    }, 3000);

    return () => clearInterval(checkTradesInterval);
  }, [openTrades, signals, tickerData]);

  // Update equity history
  useEffect(() => {
    const unrealizedPnL = openTrades.reduce((sum, t) => sum + t.pnlUSD, 0);
    const equity = STARTING_BALANCE + realizedPnL + unrealizedPnL;

    setEquityHistory(prev => {
      const newHistory = [...prev, { timestamp: Date.now(), equity }];
      return newHistory.slice(-50);
    });
  }, [openTrades, realizedPnL]);

  const unrealizedPnL = openTrades.reduce((sum, t) => sum + t.pnlUSD, 0);
  const currentEquity = STARTING_BALANCE + realizedPnL + unrealizedPnL;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Daisy — Signal-Driven Simulation</h2>
        <p className="text-sm text-muted-foreground">
          $1,000 starting balance • Theoretical trades only • Live signals from Coinglass
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Signals */}
        <Card>
          <CardHeader>
            <CardTitle>Signals & Rationale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.length === 0 ? (
              <p className="text-muted-foreground text-sm">Loading signals...</p>
            ) : (
              signals.map(signal => (
                <div key={signal.symbol} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{signal.symbol}USDT</h3>
                    <Badge variant={signal.label === "Bullish" ? "default" : signal.label === "Bearish" ? "destructive" : "secondary"}>
                      {signal.label} ({signal.score.toFixed(2)})
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Funding:</span> {(signal.funding * 100).toFixed(3)}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">ΔOI:</span> {signal.oiChange.toFixed(2)}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">L/S Ratio:</span> {signal.longShortRatio.toFixed(2)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Liq 24h:</span> ${(signal.liquidation / 1000000).toFixed(1)}M
                    </div>
                  </div>

                  <div className="text-sm bg-muted p-2 rounded">
                    <span className="font-semibold">Why now:</span> {signal.rationale}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Live Trades (Simulation)</CardTitle>
            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Equity</p>
                <p className="font-bold text-lg">${currentEquity.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Realized PnL</p>
                <p className={`font-bold ${realizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${realizedPnL.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Unrealized PnL</p>
                <p className={`font-bold ${unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${unrealizedPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Equity Chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityHistory}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  />
                  <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Open Trades */}
            <div>
              <h3 className="font-semibold mb-2">Open Positions ({openTrades.length}/{MAX_POSITIONS})</h3>
              {openTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open positions</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {openTrades.map(trade => (
                    <div key={trade.id} className="border rounded p-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{trade.symbol}USDT</span>
                        <Badge variant={trade.direction === "LONG" ? "default" : "destructive"} className="text-xs">
                          {trade.direction}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div>Entry: ${trade.entryPrice.toFixed(2)}</div>
                        <div>Last: ${trade.lastPrice.toFixed(2)}</div>
                        <div>Size: ${trade.sizeUSD.toFixed(2)}</div>
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${trade.pnlUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        PnL: ${trade.pnlUSD.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Closed Trades */}
            <div>
              <h3 className="font-semibold mb-2">Recent Closed Trades</h3>
              {closedTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No closed trades yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {closedTrades.slice(0, 5).map(trade => (
                    <div key={trade.id} className="border rounded p-2 text-sm bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{trade.symbol}USDT</span>
                        <Badge variant="outline" className="text-xs">
                          {trade.exitReason}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <div>{trade.direction} • ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}</div>
                        <div>Hold: {Math.floor((trade.holdTime || 0) / 60000)}m</div>
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${trade.pnlUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${trade.pnlUSD.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
