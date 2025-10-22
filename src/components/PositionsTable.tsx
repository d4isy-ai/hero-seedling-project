import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry: string;
  current: string;
  quantity: string;
  margin: string;
  leverage: string;
  pnl: string;
  pnlPercent: string;
  status?: string;
}

const positions: Position[] = [
  {
    symbol: 'ARBUSDT',
    side: 'SHORT',
    entry: '$0.31',
    current: '$0.31',
    quantity: '64.7088',
    margin: '$4.00',
    leverage: '5x',
    pnl: '+$0.00',
    pnlPercent: '+0.00%',
  },
  {
    symbol: 'ZKCUSDT',
    side: 'SHORT',
    entry: '$0.22',
    current: '$0.22',
    quantity: '103.0092',
    margin: '$4.50',
    leverage: '5x',
    pnl: '+$0.00',
    pnlPercent: '+0.00%',
    status: 'CLOSED',
  },
  {
    symbol: 'PROVEUSDT',
    side: 'SHORT',
    entry: '$0.80',
    current: '$0.80',
    quantity: '24.9875',
    margin: '$4.00',
    leverage: '5x',
    pnl: '+$0.00',
    pnlPercent: '+0.00%',
    status: 'CLOSED',
  },
];

export const PositionsTable = () => {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Active Positions</h3>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            Show Logs
          </button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-3">
        Auto-trading: Opens positions at ≥70% confidence • Closes at ±5% TP / -5% SL / 5min timeout • Updates every 5s
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Symbol</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Entry</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Current</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Quantity</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Margin</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Leverage</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">PNL</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Str</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{position.symbol}</span>
                    <Badge 
                      variant={position.side === 'LONG' ? 'default' : 'destructive'}
                      className={position.side === 'LONG' ? 'bg-success text-success-foreground' : ''}
                    >
                      {position.side}
                    </Badge>
                    {position.status && (
                      <Badge variant="secondary" className="text-xs">
                        {position.status}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-foreground">{position.entry}</td>
                <td className="py-3 px-2 text-foreground">{position.current}</td>
                <td className="py-3 px-2 text-right text-foreground">{position.quantity}</td>
                <td className="py-3 px-2 text-right text-foreground">{position.margin}</td>
                <td className="py-3 px-2 text-center">
                  <Badge variant="outline" className="font-mono">{position.leverage}</Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-success font-medium">{position.pnl}</div>
                  <div className="text-xs text-success">{position.pnlPercent}</div>
                </td>
                <td className="py-3 px-2 text-right">
                  <button className="text-xs text-primary hover:text-primary/80">Show</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
