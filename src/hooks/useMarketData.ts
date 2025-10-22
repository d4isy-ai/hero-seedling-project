import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
}

interface OrderBookData {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export const useMarketTicker = (symbol?: string) => {
  return useQuery({
    queryKey: ['market-ticker', symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('aster-market-ticker', {
        body: symbol ? { symbol } : {},
      });

      if (error) throw error;
      return data as TickerData | TickerData[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useOrderBook = (symbol: string, limit = 10) => {
  return useQuery({
    queryKey: ['order-book', symbol, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('aster-order-book', {
        body: { symbol, limit },
      });

      if (error) throw error;
      return data as OrderBookData;
    },
    refetchInterval: 3000, // Refresh every 3 seconds
    enabled: !!symbol,
  });
};

export const useExchangeInfo = () => {
  return useQuery({
    queryKey: ['exchange-info'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('aster-exchange-info');

      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache for 1 minute
  });
};
