-- Drop existing trades table and create new structure
DROP TABLE IF EXISTS public.trades CASCADE;

-- Orders Feed table (raw events, no PnL)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pair TEXT NOT NULL,
  action TEXT NOT NULL, -- 'OPEN', 'REDUCE', 'ADD', 'CLOSE'
  side TEXT NOT NULL, -- 'LONG' or 'SHORT'
  size NUMERIC NOT NULL, -- notional size $100-$300
  leverage INTEGER NOT NULL, -- 3x-10x
  status TEXT NOT NULL DEFAULT 'FILLED', -- 'FILLED' or 'PARTIAL'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Open Positions table (floating PnL)
CREATE TABLE public.open_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pair TEXT NOT NULL,
  side TEXT NOT NULL, -- 'LONG' or 'SHORT'
  size NUMERIC NOT NULL, -- notional size
  leverage INTEGER NOT NULL,
  entry_price NUMERIC NOT NULL, -- internal only, not displayed
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_price NUMERIC NOT NULL DEFAULT 0,
  unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
  unrealized_pnl_percent NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High'
  tp_enabled BOOLEAN NOT NULL DEFAULT false,
  sl_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Closed Trades table (realized PnL only)
CREATE TABLE public.closed_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  close_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pair TEXT NOT NULL,
  side TEXT NOT NULL,
  size NUMERIC NOT NULL,
  leverage INTEGER NOT NULL,
  realized_pnl NUMERIC NOT NULL,
  realized_pnl_percent NUMERIC NOT NULL,
  close_reason TEXT NOT NULL, -- 'TP', 'SL', 'MANUAL'
  hold_time TEXT NOT NULL, -- e.g., "27m"
  fees NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closed_trades ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to orders" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow public read access to open positions" 
ON public.open_positions FOR SELECT USING (true);

CREATE POLICY "Allow public read access to closed trades" 
ON public.closed_trades FOR SELECT USING (true);

-- Add indexes for better performance
CREATE INDEX idx_orders_timestamp ON public.orders(timestamp DESC);
CREATE INDEX idx_open_positions_pair ON public.open_positions(pair);
CREATE INDEX idx_closed_trades_close_time ON public.closed_trades(close_time DESC);