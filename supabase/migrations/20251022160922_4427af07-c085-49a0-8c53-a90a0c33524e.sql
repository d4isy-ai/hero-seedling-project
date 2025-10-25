-- Create trading state table (single row for global state)
CREATE TABLE IF NOT EXISTS public.trading_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_balance DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  starting_balance DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial state
INSERT INTO public.trading_state (id, current_balance, starting_balance)
VALUES (1, 1000.00, 1000.00)
ON CONFLICT (id) DO NOTHING;

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  size DECIMAL(10, 2) NOT NULL,
  pnl DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equity history table
CREATE TABLE IF NOT EXISTS public.equity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON public.trades(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_equity_timestamp ON public.equity_history(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.trading_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required)
CREATE POLICY "Allow public read access to trading state"
  ON public.trading_state FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to trades"
  ON public.trades FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to equity history"
  ON public.equity_history FOR SELECT
  USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equity_history;