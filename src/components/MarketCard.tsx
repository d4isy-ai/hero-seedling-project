import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

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
  const [chartData, setChartData] = useState<{ value: number }[]>([]);
  
  // Generate realistic chart data based on current price and change
  useEffect(() => {
    if (!price || isLoading) return;
    
    const currentPrice = parseFloat(price.replace(/,/g, ''));
    const changeValue = change;
    const dataPoints = 20;
    
    // Generate a realistic price movement chart
    const data = [];
    let basePrice = currentPrice - changeValue;
    
    for (let i = 0; i < dataPoints; i++) {
      // Create a smooth transition from start to current price
      const progress = i / (dataPoints - 1);
      const volatility = (Math.random() - 0.5) * (Math.abs(changeValue) * 0.3);
      const trendValue = basePrice + (changeValue * progress) + volatility;
      
      data.push({ value: trendValue });
    }
    
    setChartData(data);
  }, [price, change, isLoading]);
  
  if (isLoading) {
    return (
      <Card className="p-4 bg-secondary/50 border-border">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }
  
  return (
    <Card className="p-4 bg-secondary/50 border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
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
      
      <div className="space-y-1 mb-3">
        <p className="text-2xl font-bold text-foreground">{price}</p>
        <p className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{changePercent} ({isPositive ? '+' : ''}{change})
        </p>
      </div>
      
      {/* Mini Chart */}
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
