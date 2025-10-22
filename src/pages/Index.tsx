import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { OrderBook } from "@/components/OrderBook";
import { PositionsTable } from "@/components/PositionsTable";
import { AIStrategyEngine } from "@/components/AIStrategyEngine";
import { LiveTrading } from "@/components/LiveTrading";
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
    <div className="min-h-screen bg-gradient-stellar">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Live Market Overview */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Live Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Live Trading */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Live Trading</h2>
          <LiveTrading />
        </section>

        {/* Order Books */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Order Books</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

        {/* Active Positions */}
        <section>
          <PositionsTable />
        </section>

        {/* AI Strategy Engine */}
        <section>
          <AIStrategyEngine />
        </section>
      </main>
    </div>
  );
};

export default Index;
