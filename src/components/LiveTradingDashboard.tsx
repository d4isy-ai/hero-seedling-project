import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTradingUpdater } from "@/hooks/useTradingUpdater";
import { useTranslation } from "react-i18next";
interface TradingState {
  current_balance: number;
  starting_balance: number;
  last_updated: string;
}

interface Order {
  id: string;
  timestamp: string;
  pair: string;
  action: string;
  side: string;
  size: number;
  leverage: number;
  status: string;
}

interface OpenPosition {
  id: string;
  pair: string;
  side: string;
  size: number;
  leverage: number;
  entry_time: string;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  risk_level: string;
  tp_enabled: boolean;
  sl_enabled: boolean;
}

interface ClosedTrade {
  id: string;
  close_time: string;
  pair: string;
  side: string;
  size: number;
  leverage: number;
  realized_pnl: number;
  realized_pnl_percent: number;
  close_reason: string;
  hold_time: string;
  fees: number;
}

const formatDuration = (entryTime: string) => {
  const duration = Date.now() - new Date(entryTime).getTime();
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

export const LiveTradingDashboard = () => {
  const { t } = useTranslation();
  useTradingUpdater();
  const [tradingState, setTradingState] = useState<TradingState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);

  // Trigger price updates and position management
  useEffect(() => {
    const updatePrices = async () => {
      try {
        await supabase.functions.invoke('update-trading-state', {
          body: { action: 'update_prices' }
        });
      } catch (err) {
        console.error('Error updating prices:', err);
      }
    };

    const closeAndOpen = async () => {
      try {
        await supabase.functions.invoke('update-trading-state', {
          body: { action: 'close_and_open' }
        });
      } catch (err) {
        console.error('Error closing/opening position:', err);
      }
    };

    // Initial price update
    setTimeout(updatePrices, 2000);
    
    // Update prices every 5 seconds
    const priceInterval = setInterval(updatePrices, 5000);
    
    // Close and open positions every 2-3 minutes (random between 120-180s)
    const scheduleNextClose = () => {
      const delay = 120000 + Math.random() * 60000; // 2-3 minutes
      setTimeout(() => {
        closeAndOpen();
        scheduleNextClose();
      }, delay);
    };
    
    // First close after initial delay
    setTimeout(scheduleNextClose, 30000);

    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const { data: state } = await supabase
        .from('trading_state')
        .select('*')
        .eq('id', 1)
        .single();
      if (state) setTradingState(state);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(15);
      if (ordersData) setOrders(ordersData);

      const { data: positionsData } = await supabase
        .from('open_positions')
        .select('*')
        .order('entry_time', { ascending: false });
      if (positionsData) setOpenPositions(positionsData);

      const { data: tradesData } = await supabase
        .from('closed_trades')
        .select('*')
        .order('close_time', { ascending: false })
        .limit(20);
      if (tradesData) setClosedTrades(tradesData);
    };

    fetchData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const stateChannel = supabase
      .channel('trading-state-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trading_state' }, 
        (payload) => setTradingState(payload.new as TradingState))
      .subscribe();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => setOrders(prev => [payload.new as Order, ...prev].slice(0, 15)))
      .subscribe();

    const positionsChannel = supabase
      .channel('positions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_positions' },
        () => {
          // Refetch open positions on any change
          supabase.from('open_positions').select('*').order('entry_time', { ascending: false })
            .then(({ data }) => data && setOpenPositions(data));
        })
      .subscribe();

    const tradesChannel = supabase
      .channel('trades-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'closed_trades' },
        (payload) => setClosedTrades(prev => [payload.new as ClosedTrade, ...prev].slice(0, 20)))
      .subscribe();

    return () => {
      supabase.removeChannel(stateChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(tradesChannel);
    };
  }, []);

  if (!tradingState) {
    return <div className="text-center py-8">{t('liveTradingDashboard.loadingData')}</div>;
  }

  const pnlToday = tradingState.current_balance - tradingState.starting_balance;
  const pnlPercent = ((pnlToday / tradingState.starting_balance) * 100).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('liveTradingDashboard.title')}
        </h2>
        <p className="text-muted-foreground">{t('liveTradingDashboard.subtitle')}</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">{t('liveTradingDashboard.liveBalance')}</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 animate-pulse">
              ${tradingState.current_balance.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('liveTradingDashboard.starting')}: ${tradingState.starting_balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">{t('liveTradingDashboard.pnlToday')}</div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${pnlToday >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnlToday >= 0 ? '+' : ''}${pnlToday.toFixed(2)}
            </div>
            <div className={`text-xs ${pnlToday >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnlToday >= 0 ? '+' : ''}{pnlPercent}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">{t('liveTradingDashboard.openPositions')}</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {openPositions.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('liveTradingDashboard.activeNow')}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Orders Feed Panel */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('liveTradingDashboard.ordersFeed')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-2">{t('liveTradingDashboard.timeUtc')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.pair')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.action')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.side')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.size')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.leverage')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.status')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50">
                    <td className="py-2">
                      {new Date(order.timestamp).toLocaleTimeString('en-US', { 
                        timeZone: 'UTC', 
                        hour12: false 
                      })}
                    </td>
                    <td className="py-2 font-medium">{order.pair}</td>
                    <td className="py-2">
                      <Badge variant={
                        order.action === 'OPEN' ? 'default' :
                        order.action === 'CLOSE' ? 'secondary' : 'outline'
                      }>
                        {order.action}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge variant={order.side === 'LONG' ? 'default' : 'secondary'}>
                        {order.side}
                      </Badge>
                    </td>
                    <td className="py-2">${Number(order.size).toFixed(2)}</td>
                    <td className="py-2">{order.leverage}×</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Closed Trades Panel */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('liveTradingDashboard.closedTrades')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-2">{t('liveTradingDashboard.closeTime')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.pair')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.side')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.size')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.leverage')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.realizedPnl')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.roe')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.closeReason')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.holdTime')}</th>
                  <th className="pb-2">{t('liveTradingDashboard.fees')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {closedTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50">
                    <td className="py-2">
                      {new Date(trade.close_time).toLocaleTimeString('en-US', { 
                        timeZone: 'UTC', 
                        hour12: false 
                      })}
                    </td>
                    <td className="py-2 font-medium">{trade.pair}</td>
                    <td className="py-2">
                      <Badge variant={trade.side === 'LONG' ? 'default' : 'secondary'}>
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="py-2">${Number(trade.size).toFixed(2)}</td>
                    <td className="py-2">{trade.leverage}×</td>
                    <td className={`py-2 font-medium ${Number(trade.realized_pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(trade.realized_pnl) >= 0 ? '+' : ''}${Number(trade.realized_pnl).toFixed(2)}
                    </td>
                    <td className={`py-2 ${Number(trade.realized_pnl_percent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(trade.realized_pnl_percent) >= 0 ? '+' : ''}{Number(trade.realized_pnl_percent).toFixed(2)}%
                    </td>
                    <td className="py-2">
                      <Badge variant={
                        trade.close_reason === 'TP' ? 'default' :
                        trade.close_reason === 'SL' ? 'destructive' : 'outline'
                      }>
                        {trade.close_reason}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">{trade.hold_time}</td>
                    <td className="py-2 text-red-400">-${Number(trade.fees).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
