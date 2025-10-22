import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { OrderBook } from "@/components/OrderBook";
import { PositionsTable } from "@/components/PositionsTable";
import { AIStrategyEngine } from "@/components/AIStrategyEngine";
import { LiveTrading } from "@/components/LiveTrading";
import { AIAnalysisChat } from "@/components/AIAnalysisChat";
import { MarketStatsHero } from "@/components/MarketStatsHero";
import { MarketOverview } from "@/components/MarketOverview";
import { DaisySimulation } from "@/components/DaisySimulation";
import { useMarketTicker, useOrderBook } from "@/hooks/useMarketData";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
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
            {t('hero.title')}
          </h2>
          <p className="text-primary-foreground/80">
            {t('hero.subtitle')}
          </p>
        </div>


        {/* Daisy Signals */}
        <section>
          <DaisySimulation />
        </section>

        {/* AI Market Analysis - Full Width */}
        <section>
          <AIAnalysisChat />
        </section>

        {/* Live Market Overview - Responsive Grid */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">{t('marketPulse.title')}</h2>
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

        {/* Market Intelligence Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('marketIntelligence.title')}</h2>
          <MarketStatsHero markets={markets} isLoading={tickerLoading} />
        </section>



      </main>
    </div>
  );
};

export default Index;
