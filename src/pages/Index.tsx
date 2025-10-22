import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { OrderBook } from "@/components/OrderBook";
import { PositionsTable } from "@/components/PositionsTable";
import { AIStrategyEngine } from "@/components/AIStrategyEngine";
import { LiveTrading } from "@/components/LiveTrading";
import { AIAnalysisChat } from "@/components/AIAnalysisChat";
import { MarketStatsHero } from "@/components/MarketStatsHero";
import { useMarketTicker, useOrderBook } from "@/hooks/useMarketData";
import { useEffect, useState } from "react";

const Index = () => {
  const { data: tickerData, isLoading: tickerLoading } = useMarketTicker();
  const [selectedSymbols] = useState(['ASTERUSDT', 'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT']);
  
  const { data: orderBookASTER, isLoading: loadingASTER } = useOrderBook('ASTERUSDT', 10);
  const { data: orderBookBTC, isLoading: loadingBTC } = useOrderBook('BTCUSDT', 10);
  const { data: orderBookETH, isLoading: loadingETH } = useOrderBook('ETHUSDT', 10);

  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    if (tickerData && Array.isArray(tickerData)) {
      // Filter to only show our selected symbols
      const filteredTickers = tickerData
        .filter((ticker: any) => selectedSymbols.includes(ticker.symbol))
        .map((ticker: any) => ({
          symbol: ticker.symbol,
          pair: `${ticker.symbol.replace('USDT', '')} / TetherUS`,
          price: parseFloat(ticker.lastPrice).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
          }),
          change: parseFloat(ticker.priceChange),
          changePercent: `${parseFloat(ticker.priceChangePercent).toFixed(2)}%`,
        }));
      
      setMarkets(filteredTickers);
    }
  }, [tickerData, selectedSymbols]);

  const formatOrderBookData = (rawData: any) => {
    if (!rawData) return { bids: [], asks: [] };
    
    return {
      bids: rawData.bids?.slice(0, 5).map(([price, amount]: [string, string]) => ({
        price: parseFloat(price).toFixed(2),
        amount: parseFloat(amount).toFixed(3),
        total: (parseFloat(price) * parseFloat(amount)).toFixed(2),
      })) || [],
      asks: rawData.asks?.slice(0, 5).map(([price, amount]: [string, string]) => ({
        price: parseFloat(price).toFixed(2),
        amount: parseFloat(amount).toFixed(3),
        total: (parseFloat(price) * parseFloat(amount)).toFixed(2),
      })) || [],
    };
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Hero Section with Gradient */}
        <div className="bg-gradient-daisy rounded-xl p-6 text-center shadow-glow-primary">
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">
            Autonomous Trading, Simplified
          </h2>
          <p className="text-primary-foreground/80">
            AI-powered market intelligence meets effortless execution
          </p>
        </div>

        {/* Market Stats Hero */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Market Intelligence</h2>
          <MarketStatsHero markets={markets} isLoading={tickerLoading} />
        </section>

        {/* Two Column Layout - Trading + AI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Daisy Live Trading */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-2xl">🌼</span> Daisy Live Trading
            </h2>
            <LiveTrading />
          </section>

          {/* Right Column - AI Market Analysis */}
          <section className="h-[500px] sm:h-[600px]">
            <AIAnalysisChat />
          </section>
        </div>

        {/* Live Market Overview - Responsive Grid */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Market Pulse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tickerLoading ? (
              selectedSymbols.map((symbol) => (
                <MarketCard 
                  key={symbol}
                  symbol={symbol}
                  pair=""
                  price=""
                  change={0}
                  changePercent=""
                  isLoading={true}
                />
              ))
            ) : (
              markets.map((market) => (
                <MarketCard key={market.symbol} {...market} />
              ))
            )}
          </div>
        </section>

        {/* Order Books - Responsive Grid */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Order Flow</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <OrderBook 
              symbol="ASTERUSDT" 
              {...formatOrderBookData(orderBookASTER)}
              isLoading={loadingASTER}
            />
            <OrderBook 
              symbol="BTCUSDT" 
              {...formatOrderBookData(orderBookBTC)}
              isLoading={loadingBTC}
            />
            <OrderBook 
              symbol="ETHUSDT" 
              {...formatOrderBookData(orderBookETH)}
              isLoading={loadingETH}
            />
          </div>
        </section>

        {/* Active Positions - Full Width */}
        <section className="bg-card/30 rounded-lg p-1 border border-border/50">
          <PositionsTable />
        </section>
      </main>
    </div>
  );
};

export default Index;
