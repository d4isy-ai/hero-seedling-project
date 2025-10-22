import { Card } from "@/components/ui/card";

interface Order {
  price: string;
  amount: string;
  total?: string;
}

interface OrderBookProps {
  symbol: string;
  bids: Order[];
  asks: Order[];
}

export const OrderBook = ({ symbol, bids, asks }: OrderBookProps) => {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">{symbol}</h3>
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>
      
      <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2 px-2">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>
      
      <div className="space-y-1 mb-4">
        {asks.slice(0, 5).reverse().map((ask, i) => (
          <div key={i} className="grid grid-cols-3 text-xs px-2 py-1 rounded hover:bg-destructive/10 transition-colors relative">
            <div className="absolute inset-0 bg-destructive/5" style={{ width: `${Math.random() * 60 + 20}%` }} />
            <span className="text-destructive font-medium relative z-10">{ask.price}</span>
            <span className="text-right text-foreground relative z-10">{ask.amount}</span>
            <span className="text-right text-muted-foreground relative z-10">{ask.total}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-border my-2 pt-2">
        <div className="text-center text-sm font-bold text-foreground mb-2">
          Spread: 0.01
        </div>
      </div>
      
      <div className="space-y-1">
        {bids.slice(0, 5).map((bid, i) => (
          <div key={i} className="grid grid-cols-3 text-xs px-2 py-1 rounded hover:bg-success/10 transition-colors relative">
            <div className="absolute inset-0 bg-success/5" style={{ width: `${Math.random() * 60 + 20}%` }} />
            <span className="text-success font-medium relative z-10">{bid.price}</span>
            <span className="text-right text-foreground relative z-10">{bid.amount}</span>
            <span className="text-right text-muted-foreground relative z-10">{bid.total}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
