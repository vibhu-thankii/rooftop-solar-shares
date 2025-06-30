export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      host_applications: {
        Row: {
          admin_notes: string | null
          application_status: string | null
          created_at: string
          electricity_bill: number | null
          email: string
          full_name: string
          id: string
          phone: string
          property_address: string
          property_type: string
          roof_area: number | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          application_status?: string | null
          created_at?: string
          electricity_bill?: number | null
          email: string
          full_name: string
          id?: string
          phone: string
          property_address: string
          property_type: string
          roof_area?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          application_status?: string | null
          created_at?: string
          electricity_bill?: number | null
          email?: string
          full_name?: string
          id?: string
          phone?: string
          property_address?: string
          property_type?: string
          roof_area?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string
          id: string
          investment_date: string
          payment_status: string | null
          project_id: string
          razorpay_payment_id: string | null
          shares_purchased: number
          user_id: string
        }
        Insert: {
          amount_invested: number
          created_at?: string
          id?: string
          investment_date?: string
          payment_status?: string | null
          project_id: string
          razorpay_payment_id?: string | null
          shares_purchased: number
          user_id: string
        }
        Update: {
          amount_invested?: number
          created_at?: string
          id?: string
          investment_date?: string
          payment_status?: string | null
          project_id?: string
          razorpay_payment_id?: string | null
          shares_purchased?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_performance: {
        Row: {
          created_at: string
          id: string
          month: string
          savings_amount: number
          total_generation_kwh: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          savings_amount?: number
          total_generation_kwh?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          savings_amount?: number
          total_generation_kwh?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          available_shares: number
          capacity_kw: number
          created_at: string
          description: string | null
          expected_roi: number | null
          id: string
          image_url: string | null
          installation_date: string | null
          location: string
          price_per_share: number
          project_status: string | null
          sold_shares: number | null
          title: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          available_shares: number
          capacity_kw: number
          created_at?: string
          description?: string | null
          expected_roi?: number | null
          id?: string
          image_url?: string | null
          installation_date?: string | null
          location: string
          price_per_share: number
          project_status?: string | null
          sold_shares?: number | null
          title: string
          total_cost: number
          updated_at?: string
        }
        Update: {
          available_shares?: number
          capacity_kw?: number
          created_at?: string
          description?: string | null
          expected_roi?: number | null
          id?: string
          image_url?: string | null
          installation_date?: string | null
          location?: string
          price_per_share?: number
          project_status?: string | null
          sold_shares?: number | null
          title?: string
          total_cost?: number
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
