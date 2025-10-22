import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCoinGlassData = (symbol: string, endpoint: string) => {
  return useQuery({
    queryKey: ['coinglass', endpoint, symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('coinglass-data', {
        body: { symbol, endpoint },
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });
};
