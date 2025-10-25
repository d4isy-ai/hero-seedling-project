import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface MarketStatsHeroProps {
  markets: any[];
  isLoading?: boolean;
}

export const MarketStatsHero = ({ markets, isLoading }: MarketStatsHeroProps) => {
  const { t } = useTranslation();
  
  // Calculate aggregate stats from market data
  const totalVolume = markets.reduce((sum, m) => sum + (parseFloat(m.change) || 0), 0);
  const avgChange = markets.length > 0 ? totalVolume / markets.length : 0;
  const gainers = markets.filter(m => m.change > 0).length;
  const losers = markets.filter(m => m.change < 0).length;
  const activeMarkets = markets.length;

  const stats = [
    {
      label: t('marketStats.marketSentiment'),
      value: avgChange >= 0 ? t('marketStats.bullish') : t('marketStats.bearish'),
      subValue: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
      icon: TrendingUp,
      gradient: "from-success/20 to-success/5",
      iconColor: avgChange >= 0 ? "text-success" : "text-destructive"
    },
    {
      label: t('marketStats.activeMarkets'),
      value: activeMarkets.toString(),
      subValue: `${gainers} ${t('marketStats.gainers')}, ${losers} ${t('marketStats.losers')}`,
      icon: Activity,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary"
    },
    {
      label: t('marketStats.topPerformer'),
      value: markets.length > 0 
        ? markets.reduce((max, m) => m.change > max.change ? m : max, markets[0])?.symbol.replace('USDT', '') || 'N/A'
        : 'N/A',
      subValue: markets.length > 0 
        ? `${markets.reduce((max, m) => m.change > max.change ? m : max, markets[0])?.changePercent || '0%'}`
        : '0%',
      icon: BarChart3,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent"
    },
    {
      label: t('marketStats.marketCoverage'),
      value: "8",
      subValue: t('marketStats.majorPairs'),
      icon: DollarSign,
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary-foreground"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-gradient-to-br from-card/50 to-card/30 border-border/50 animate-pulse">
            <div className="h-24 bg-muted/20 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className={`group relative overflow-hidden p-6 bg-gradient-to-br ${stat.gradient} border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow-primary`}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.iconColor}`}>
                  {stat.subValue}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-background/50 ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Animated border gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
};
