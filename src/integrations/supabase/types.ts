export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      closed_trades: {
        Row: {
          close_reason: string
          close_time: string
          created_at: string
          fees: number
          hold_time: string
          id: string
          leverage: number
          pair: string
          realized_pnl: number
          realized_pnl_percent: number
          side: string
          size: number
        }
        Insert: {
          close_reason: string
          close_time?: string
          created_at?: string
          fees?: number
          hold_time: string
          id?: string
          leverage: number
          pair: string
          realized_pnl: number
          realized_pnl_percent: number
          side: string
          size: number
        }
        Update: {
          close_reason?: string
          close_time?: string
          created_at?: string
          fees?: number
          hold_time?: string
          id?: string
          leverage?: number
          pair?: string
          realized_pnl?: number
          realized_pnl_percent?: number
          side?: string
          size?: number
        }
        Relationships: []
      }
      equity_history: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          timestamp: string | null
        }
        Insert: {
          balance: number
          created_at?: string | null
          id?: string
          timestamp?: string | null
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      open_positions: {
        Row: {
          created_at: string
          current_price: number
          entry_price: number
          entry_time: string
          id: string
          leverage: number
          pair: string
          risk_level: string
          side: string
          size: number
          sl_enabled: boolean
          tp_enabled: boolean
          unrealized_pnl: number
          unrealized_pnl_percent: number
        }
        Insert: {
          created_at?: string
          current_price?: number
          entry_price: number
          entry_time?: string
          id?: string
          leverage: number
          pair: string
          risk_level?: string
          side: string
          size: number
          sl_enabled?: boolean
          tp_enabled?: boolean
          unrealized_pnl?: number
          unrealized_pnl_percent?: number
        }
        Update: {
          created_at?: string
          current_price?: number
          entry_price?: number
          entry_time?: string
          id?: string
          leverage?: number
          pair?: string
          risk_level?: string
          side?: string
          size?: number
          sl_enabled?: boolean
          tp_enabled?: boolean
          unrealized_pnl?: number
          unrealized_pnl_percent?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          action: string
          created_at: string
          id: string
          leverage: number
          pair: string
          side: string
          size: number
          status: string
          timestamp: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          leverage: number
          pair: string
          side: string
          size: number
          status?: string
          timestamp?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          leverage?: number
          pair?: string
          side?: string
          size?: number
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      trading_state: {
        Row: {
          current_balance: number
          id: number
          last_updated: string | null
          starting_balance: number
        }
        Insert: {
          current_balance?: number
          id?: number
          last_updated?: string | null
          starting_balance?: number
        }
        Update: {
          current_balance?: number
          id?: number
          last_updated?: string | null
          starting_balance?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
