import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { OrderBook } from "@/components/OrderBook";
import { PositionsTable } from "@/components/PositionsTable";
import { AIStrategyEngine } from "@/components/AIStrategyEngine";

const Index = () => {
  const markets = [
    { symbol: 'ASTERUSDT', pair: 'ASTER / TetherUS', price: '1.051', change: 0.009, changePercent: '0.86%' },
    { symbol: 'BTCUSDT', pair: 'Bitcoin / TetherUS', price: '108,462.45', change: 164.78, changePercent: '0.15%' },
    { symbol: 'ETHUSDT', pair: 'Ethereum / TetherUS', price: '3,871.52', change: 1.53, changePercent: '0.04%' },
    { symbol: 'BNBUSDT', pair: 'Binance Coin / TetherUS', price: '1,070.88', change: -5.32, changePercent: '-0.49%' },
    { symbol: 'SOLUSDT', pair: 'SOL / TetherUS', price: '186.13', change: 2.45, changePercent: '1.33%' },
    { symbol: 'XRPUSDT', pair: 'XRP / TetherUS', price: '2.4291', change: -0.0123, changePercent: '-0.50%' },
    { symbol: 'DOGEUSDT', pair: 'Dogecoin / TetherUS', price: '0.19479', change: 0.00234, changePercent: '1.22%' },
    { symbol: 'ADAUSDT', pair: 'Cardano / TetherUS', price: '0.6442', change: -0.0087, changePercent: '-1.33%' },
  ];

  const orderBookData = {
    ASTERUSDT: {
      bids: [
        { price: '1.05', amount: '1377.000', total: '12.991' },
        { price: '1.05', amount: '1801.000', total: '32.075' },
        { price: '1.05', amount: '9040.000', total: '11.434' },
        { price: '1.05', amount: '13282.000', total: '8.006' },
        { price: '1.04', amount: '20096.000', total: '0.023' },
      ],
      asks: [
        { price: '1.05', amount: '932.000', total: '2.512' },
        { price: '1.05', amount: '8892.000', total: '1.024' },
        { price: '1.05', amount: '4457.000', total: '0.002' },
        { price: '1.05', amount: '1952.000', total: '0.007' },
        { price: '1.05', amount: '952.000', total: '0.00' },
      ],
    },
    BTCUSDT: {
      bids: [
        { price: '108450.00', amount: '0.052', total: '6.002' },
        { price: '108440.40', amount: '0.051', total: '0.851' },
        { price: '108410.20', amount: '0.002', total: '0.002' },
        { price: '108410.10', amount: '0.007', total: '0.002' },
        { price: '108409.50', amount: '0.023', total: '319.150' },
      ],
      asks: [
        { price: '108455.50', amount: '0.052', total: '6.230' },
        { price: '108460.50', amount: '0.051', total: '1.027' },
        { price: '108464.54', amount: '0.017', total: '0.017' },
        { price: '108469.54', amount: '0.002', total: '0.002' },
        { price: '108410.00', amount: '2.512', total: '76.095' },
      ],
    },
    ETHUSDT: {
      bids: [
        { price: '3869.51', amount: '12.991', total: '8.784' },
        { price: '3869.48', amount: '2.075', total: '0.064' },
        { price: '3869.49', amount: '11.434', total: '0.017' },
        { price: '3868.48', amount: '8.006', total: '0.019' },
        { price: '3869.46', amount: '0.023', total: '319.150' },
      ],
      asks: [
        { price: '3869.55', amount: '6.230', total: '6.230' },
        { price: '3869.56', amount: '1.027', total: '1.027' },
        { price: '3869.64', amount: '0.017', total: '0.017' },
        { price: '3869.52', amount: '76.095', total: '76.095' },
        { price: '3869.52', amount: '76.095', total: '76.095' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-stellar">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Live Market Overview */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Live Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {markets.map((market) => (
              <MarketCard key={market.symbol} {...market} />
            ))}
          </div>
        </section>

        {/* Order Books */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Order Books</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <OrderBook symbol="ASTERUSDT" {...orderBookData.ASTERUSDT} />
            <OrderBook symbol="BTCUSDT" {...orderBookData.BTCUSDT} />
            <OrderBook symbol="ETHUSDT" {...orderBookData.ETHUSDT} />
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
