import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface Strategy {
  symbol: string;
  signal: 'BULLISH' | 'BEARISH';
  confidence: number;
  strategy: string;
  description: string;
  rsi: string;
  sma20: string;
  sma50: string;
  volume: string;
  time: string;
}

const strategies: Strategy[] = [
  {
    symbol: 'FFUSDT',
    signal: 'BULLISH',
    confidence: 70,
    strategy: 'Momentum Buy',
    description: 'The price is near its 24h high with a strong 24h change, and the RSI is below overbought levels, indicating potential upward momentum. Despite the bearish order book imbalance, the current price above both SMAs supports a bullish outlook.',
    rsi: '59.80',
    sma20: '$0.16',
    sma50: '$0.14',
    volume: '-95.47%',
    time: '12:09:56 AM',
  },
  {
    symbol: 'ARBUSDT',
    signal: 'BEARISH',
    confidence: 70,
    strategy: 'Short Sell',
    description: 'With the RSI at 25.39 indicating oversold conditions and the current price below both SMAs, the market shows bearish momentum. Although the order book imbalance is slightly bullish, the overall price trend and low volume suggest further downside potential.',
    rsi: '25.39',
    sma20: '$0.32',
    sma50: '$0.32',
    volume: '-85.22%',
    time: '12:09:37 AM',
  },
];

export const AIStrategyEngine = () => {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground">AI Strategy Engine</h3>
          <Info className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>
      </div>
      
      <div className="space-y-4">
        {strategies.map((strat, i) => (
          <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${strat.signal === 'BULLISH' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                  {strat.signal === 'BULLISH' ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{strat.symbol}</span>
                    <Badge 
                      variant={strat.signal === 'BULLISH' ? 'default' : 'destructive'}
                      className={`${strat.signal === 'BULLISH' ? 'bg-success text-success-foreground' : ''} shadow-glow-${strat.signal === 'BULLISH' ? 'success' : 'destructive'}`}
                    >
                      ↗ {strat.signal}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{strat.confidence}% confidence</span>
                  </div>
                  <p className="text-sm font-medium text-primary">Strategy: {strat.strategy}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{strat.time}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{strat.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">RSI</p>
                <p className="text-sm font-bold text-foreground">{strat.rsi}</p>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">SMA 20</p>
                <p className="text-sm font-bold text-foreground">{strat.sma20}</p>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">SMA 50</p>
                <p className="text-sm font-bold text-foreground">{strat.sma50}</p>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">Volume</p>
                <p className="text-sm font-bold text-destructive">{strat.volume}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
