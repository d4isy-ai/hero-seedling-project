import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketCardProps {
  symbol: string;
  pair: string;
  price: string;
  change: number;
  changePercent: string;
  isLoading?: boolean;
}

export const MarketCard = ({ symbol, pair, price, change, changePercent, isLoading }: MarketCardProps) => {
  const isPositive = change >= 0;
  
  if (isLoading) {
    return (
      <Card className="p-4 bg-secondary/50 border-border">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }
  
  return (
    <Card className="relative overflow-hidden p-4 bg-secondary/50 border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 opacity-10 ${
        isPositive 
          ? 'bg-gradient-to-br from-success/40 via-success/20 to-transparent' 
          : 'bg-gradient-to-br from-destructive/40 via-destructive/20 to-transparent'
      } group-hover:opacity-20 transition-opacity`} />
      
      {/* Animated wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden opacity-30">
        <div className={`absolute inset-0 ${
          isPositive ? 'bg-success/20' : 'bg-destructive/20'
        }`}>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" 
              className={`${isPositive ? 'fill-success/40' : 'fill-destructive/40'} animate-pulse`}
            />
            <path 
              d="M0,80 Q150,40 300,80 T600,80 T900,80 T1200,80 L1200,120 L0,120 Z" 
              className={`${isPositive ? 'fill-success/20' : 'fill-destructive/20'}`}
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">{symbol}</h3>
            <p className="text-xs text-muted-foreground">{pair}</p>
          </div>
          <div className={`p-2 rounded-full ${
            isPositive ? 'bg-success/20' : 'bg-destructive/20'
          } group-hover:scale-110 transition-transform`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
        
        <div className="space-y-1 mb-3">
          <p className="text-2xl font-bold text-foreground">{price}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{changePercent} ({isPositive ? '+' : ''}{change})
          </p>
        </div>
      </div>
    </Card>
  );
};
