import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTradingUpdater = () => {
  useEffect(() => {
    const initPositions = async () => {
      try {
        console.log('Initializing 2 open positions...');
        await supabase.functions.invoke('update-trading-state', {
          body: { action: 'open_position' }
        });
        await supabase.functions.invoke('update-trading-state', {
          body: { action: 'open_position' }
        });
      } catch (err) {
        console.error('Failed to init positions:', err);
      }
    };

    const timer = setTimeout(initPositions, 1000);
    return () => clearTimeout(timer);
  }, []);
};