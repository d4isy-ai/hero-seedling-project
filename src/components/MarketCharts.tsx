import { Card } from "@/components/ui/card";
import { useCoinGlassData } from "@/hooks/useCoinGlassData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const MarketCharts = () => {
  const { t } = useTranslation();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  
  // Get data for selected symbol
  const { data: openInterestData } = useCoinGlassData(selectedSymbol, 'openInterest');
  const { data: liquidationData } = useCoinGlassData(selectedSymbol, 'liquidation');
  
  // Mock price history data (24h)
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [openInterestHistory, setOpenInterestHistory] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate mock 24h price data
    const now = Date.now();
    const mockPriceData = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now - (23 - i) * 60 * 60 * 1000);
      const basePrice = selectedSymbol === 'BTC' ? 107000 : selectedSymbol === 'ETH' ? 3800 : 650;
      const variance = basePrice * 0.02;
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + (Math.random() - 0.5) * variance,
      };
    });
    setPriceHistory(mockPriceData);

    // Generate mock OI data
    const baseOI = openInterestData?.data?.usdVolume || 68000000000;
    const mockOIData = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now - (23 - i) * 60 * 60 * 1000);
      const variance = baseOI * 0.01;
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: (baseOI + (Math.random() - 0.5) * variance) / 1000000000, // Convert to billions
      };
    });
    setOpenInterestHistory(mockOIData);
  }, [selectedSymbol, openInterestData]);

  // Mock exchange data
  const exchangeBuyRatios = [
    { name: 'Binance', ratio: 52.3 },
    { name: 'OKX', ratio: 49.8 },
    { name: 'Bybit', ratio: 54.2 },
    { name: 'KuCoin', ratio: 48.5 },
    { name: 'Gate', ratio: 51.7 },
    { name: 'Bitget', ratio: 50.2 },
    { name: 'BingX', ratio: 47.9 },
    { name: 'MEXC', ratio: 49.3 },
  ];

  const exchangeLiquidations = [
    { name: 'Binance', longs: 3.2, shorts: 1.8 },
    { name: 'OKX', longs: 2.1, shorts: 1.5 },
    { name: 'Bybit', longs: 2.8, shorts: 1.3 },
    { name: 'Gate', longs: 1.5, shorts: 0.9 },
    { name: 'Hyperliquid', longs: 1.2, shorts: 0.7 },
    { name: 'CoinEx', longs: 0.8, shorts: 0.5 },
    { name: 'HTX', longs: 0.6, shorts: 0.4 },
    { name: 'Bitmex', longs: 0.4, shorts: 0.3 },
  ];

  // Mock Fear & Greed Index history (30 days)
  const fearGreedHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 30 + Math.random() * 40, // Range between 30-70
    };
  });

  const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div className="flex gap-2 flex-wrap">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-primary text-primary-foreground shadow-glow-primary'
                : 'bg-card hover:bg-card/80 text-muted-foreground'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History Chart */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t('charts.priceHistory')} (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Open Interest Chart */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t('charts.openInterest')} (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={openInterestHistory}>
              <defs>
                <linearGradient id="oiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(1)}B`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`$${value.toFixed(2)}B`, 'OI']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#oiGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Active Buy Ratio by Exchange */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t('charts.exchangeBuyRatio')}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={exchangeBuyRatios} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`${value}%`, 'Buy Ratio']}
              />
              <Bar dataKey="ratio" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Liquidations by Exchange */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t('charts.exchangeLiquidations')} (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={exchangeLiquidations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`$${value}M`, '']}
              />
              <Bar dataKey="longs" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 0, 0]} name="Long Liquidations" />
              <Bar dataKey="shorts" stackId="a" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Short Liquidations" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Fear & Greed Index History */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t('charts.fearGreedHistory')} (30 {t('charts.days')})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={fearGreedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                interval={4}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [value.toFixed(0), 'Index']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--secondary))', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};