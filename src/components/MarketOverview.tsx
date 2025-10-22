import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Scale, AlertTriangle, Activity, BarChart3, Package } from "lucide-react";
import { useCoinGlassData } from "@/hooks/useCoinGlassData";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const COINGLASS_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'ETC', name: 'Ethereum Classic' },
  { symbol: 'XLM', name: 'Stellar' },
  { symbol: 'FIL', name: 'Filecoin' },
  { symbol: 'TRX', name: 'Tron' },
  { symbol: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'ICP', name: 'Internet Computer' },
];

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  icon: React.ReactNode;
  isPositive?: boolean;
  isLoading?: boolean;
}

const MetricCard = ({ title, value, subtitle, change, icon, isPositive, isLoading }: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-4 bg-card border-border">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        <div className="text-primary/60">{icon}</div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        {change && (
          <div className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {change}
          </div>
        )}
      </div>
    </Card>
  );
};

export const MarketOverview = () => {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('BTC');
  
  const { data: openInterest, isLoading: loadingOI } = useCoinGlassData(symbol, 'openInterest');
  const { data: fundingRate, isLoading: loadingFR } = useCoinGlassData(symbol, 'fundingRate');
  const { data: longShort, isLoading: loadingLS } = useCoinGlassData(symbol, 'longShortRatio');
  const { data: liquidation, isLoading: loadingLiq } = useCoinGlassData(symbol, 'liquidation');
  const { data: fearGreed, isLoading: loadingFG } = useCoinGlassData(symbol, 'fearGreed');
  const { data: rsi, isLoading: loadingRSI } = useCoinGlassData(symbol, 'rsi');
  const { data: activeBuy, isLoading: loadingAB } = useCoinGlassData(symbol, 'activeBuy');
  const { data: optionsOI, isLoading: loadingOpt } = useCoinGlassData(symbol, 'optionsOI');

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(4)}%`;
  };

  // Parse data safely
  const oiValue = openInterest?.data?.usdVolume || 0;
  const oiChange = openInterest?.data?.changePercent || 0;
  
  const frValue = fundingRate?.data?.weightedFundingRate || 0;
  
  const lsRatio = longShort?.data?.ratio || 0;
  const longPercent = longShort?.data?.longPercent || 0;
  
  const liqValue = liquidation?.data?.totalLiquidation || 0;
  
  const fgValue = fearGreed?.data?.value || 0;
  const fgLabel = fearGreed?.data?.valueClassification || 'Neutral';
  
  const rsiValue = rsi?.data?.rsi || 0;
  const rsiLabel = rsiValue > 70 ? 'Overbought' : rsiValue < 30 ? 'Oversold' : 'Neutral';
  
  const buyRatio = activeBuy?.data?.buyRatio || 0;
  
  const optValue = optionsOI?.data?.totalOpenInterest || 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('marketOverview.title')}</h2>
          <span className="text-sm text-muted-foreground">{t('marketOverview.subtitle')}</span>
        </div>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {COINGLASS_COINS.map(coin => (
              <SelectItem key={coin.symbol} value={coin.symbol}>
                {coin.symbol} - {coin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('marketOverview.openInterest')}
          value={formatCurrency(oiValue)}
          change={formatPercentage(oiChange)}
          isPositive={oiChange >= 0}
          icon={<TrendingUp className="w-4 h-4" />}
          isLoading={loadingOI}
        />
        
        <MetricCard
          title={t('marketOverview.fundingRate')}
          value={formatPercentage(frValue)}
          icon={<DollarSign className="w-4 h-4" />}
          isLoading={loadingFR}
        />
        
        <MetricCard
          title={t('marketOverview.longShortRatio')}
          value={lsRatio.toFixed(2)}
          subtitle={`${longPercent.toFixed(1)}% ${t('marketOverview.long')}`}
          icon={<Scale className="w-4 h-4" />}
          isLoading={loadingLS}
        />
        
        <MetricCard
          title={t('marketOverview.liquidations')}
          value={formatCurrency(liqValue)}
          icon={<AlertTriangle className="w-4 h-4" />}
          isLoading={loadingLiq}
        />
        
        <MetricCard
          title={t('marketOverview.fearGreed')}
          value={fgValue.toString()}
          subtitle={fgLabel}
          icon={<Activity className="w-4 h-4" />}
          isLoading={loadingFG}
        />
        
        <MetricCard
          title={t('marketOverview.rsi')}
          value={rsiValue.toFixed(1)}
          subtitle={rsiLabel}
          icon={<BarChart3 className="w-4 h-4" />}
          isLoading={loadingRSI}
        />
        
        <MetricCard
          title={t('marketOverview.activeBuyRatio')}
          value={`${buyRatio.toFixed(1)}%`}
          icon={<TrendingDown className="w-4 h-4" />}
          isLoading={loadingAB}
        />
        
        <MetricCard
          title={t('marketOverview.optionsOI')}
          value={formatCurrency(optValue)}
          icon={<Package className="w-4 h-4" />}
          isLoading={loadingOpt}
        />
      </div>
    </section>
  );
};
