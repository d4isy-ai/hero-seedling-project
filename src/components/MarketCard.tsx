import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MarketCardProps {
  symbol: string;
  pair: string;
  price: string;
  change: number;
  changePercent: string;
}

export const MarketCard = ({ symbol, pair, price, change, changePercent }: MarketCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="p-4 bg-secondary/50 border-border hover:border-primary/50 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg text-foreground">{symbol}</h3>
          <p className="text-xs text-muted-foreground">{pair}</p>
        </div>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : (
          <TrendingDown className="w-4 h-4 text-destructive" />
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">{price}</p>
        <p className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{changePercent} ({isPositive ? '+' : ''}{change})
        </p>
      </div>
      
      <div className="mt-3 h-16 bg-background/50 rounded flex items-end justify-between px-1 gap-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`w-full ${isPositive ? 'bg-success/30' : 'bg-destructive/30'} rounded-t transition-all group-hover:opacity-80`}
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </Card>
  );
};
