import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Scale, AlertTriangle, Activity, Target, BarChart3, PieChart } from "lucide-react";
import { useState } from "react";
import { useCoinGlassData } from "@/hooks/useCoinGlassData";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL'];

export const MarketOverviewDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  const { data: openInterest, isLoading: loadingOI } = useCoinGlassData(selectedSymbol, 'openInterest');
  const { data: fundingRate, isLoading: loadingFR } = useCoinGlassData(selectedSymbol, 'fundingRate');
  const { data: longShortRatio, isLoading: loadingLSR } = useCoinGlassData(selectedSymbol, 'longShortRatio');
  const { data: liquidation, isLoading: loadingLiq } = useCoinGlassData(selectedSymbol, 'liquidation');
  const { data: fearGreed, isLoading: loadingFG } = useCoinGlassData(selectedSymbol, 'fearGreed');
  const { data: rsi, isLoading: loadingRSI } = useCoinGlassData(selectedSymbol, 'rsi');
  const { data: activeBuy, isLoading: loadingAB } = useCoinGlassData(selectedSymbol, 'activeBuy');
  const { data: optionsOI, isLoading: loadingOpt } = useCoinGlassData(selectedSymbol, 'optionsOI');

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    loading,
    sentiment 
  }: { 
    title: string; 
    value: string; 
    change?: string; 
    icon: any; 
    loading: boolean;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs">{title}</CardDescription>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${
                sentiment === 'positive' ? 'text-green-500' : 
                sentiment === 'negative' ? 'text-red-500' : 
                'text-muted-foreground'
              }`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  // Extract metrics from API responses (adjust based on actual API response structure)
  const oiValue = openInterest?.data?.totalOpenInterest || '0';
  const oiChange = openInterest?.data?.change24h || '0%';
  const frValue = fundingRate?.data?.averageFundingRate || '0%';
  const lsrValue = longShortRatio?.data?.ratio || '0';
  const lsrLong = longShortRatio?.data?.longPercentage || '0%';
  const liqValue = liquidation?.data?.total24h || '$0';
  const fgValue = fearGreed?.data?.value || '0';
  const fgLabel = fearGreed?.data?.valueClassification || 'Neutral';
  const rsiValue = rsi?.data?.value || '0';
  const rsiLabel = rsi?.data?.signal || 'Neutral';
  const abValue = activeBuy?.data?.buyRatio || '0%';
  const optValue = optionsOI?.data?.totalOI || '$0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Overview</h2>
          <p className="text-muted-foreground">Real-time futures market analysis</p>
        </div>
        <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map(symbol => (
              <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Open Interest"
          value={oiValue}
          change={oiChange}
          icon={TrendingUp}
          loading={loadingOI}
          sentiment={parseFloat(oiChange) > 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          title="Avg Funding Rate"
          value={frValue}
          icon={DollarSign}
          loading={loadingFR}
          sentiment={parseFloat(frValue) < 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          title="Long/Short Ratio"
          value={lsrValue}
          change={lsrLong + ' Long'}
          icon={Scale}
          loading={loadingLSR}
        />
        <MetricCard
          title="24h Liquidations"
          value={liqValue}
          icon={AlertTriangle}
          loading={loadingLiq}
          sentiment="negative"
        />
        <MetricCard
          title="Fear & Greed"
          value={fgValue}
          change={fgLabel}
          icon={Activity}
          loading={loadingFG}
        />
        <MetricCard
          title="RSI (24h)"
          value={rsiValue}
          change={rsiLabel}
          icon={Target}
          loading={loadingRSI}
        />
        <MetricCard
          title="Active Buy Ratio"
          value={abValue}
          icon={BarChart3}
          loading={loadingAB}
        />
        <MetricCard
          title="Options OI"
          value={optValue}
          icon={PieChart}
          loading={loadingOpt}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price History (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={openInterest?.data?.priceHistory || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="price" 
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
            <CardTitle className="text-lg">Open Interest (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={openInterest?.data?.history || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="oi" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exchange Active Buy Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeBuy?.data?.exchanges || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ratio" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exchange Liquidations (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={liquidation?.data?.exchanges || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="long" fill="hsl(var(--destructive))" name="Long Liq" />
                <Bar dataKey="short" fill="hsl(var(--chart-2))" name="Short Liq" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
