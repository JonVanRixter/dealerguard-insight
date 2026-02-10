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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      completed_rechecks: {
        Row: {
          completed_at: string
          dealer_name: string
          id: string
          notes: string | null
          recheck_month: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          dealer_name: string
          id?: string
          notes?: string | null
          recheck_month: number
          user_id: string
        }
        Update: {
          completed_at?: string
          dealer_name?: string
          id?: string
          notes?: string | null
          recheck_month?: number
          user_id?: string
        }
        Relationships: []
      }
      dealer_documents: {
        Row: {
          category: string
          created_at: string
          dealer_name: string
          description: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          dealer_name: string
          description?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          dealer_name?: string
          description?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dismissed_duplicates: {
        Row: {
          dismissed_at: string
          duplicate_key: string
          id: string
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          duplicate_key: string
          id?: string
          user_id: string
        }
        Update: {
          dismissed_at?: string
          duplicate_key?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          amber_threshold: number
          animations: boolean
          compact_mode: boolean
          created_at: string
          css_oversight_threshold: number
          css_reward_threshold: number
          date_format: string
          digest_frequency: string
          email_audit_reminders: boolean
          email_critical: boolean
          email_warning: boolean
          email_weekly_summary: boolean
          green_threshold: number
          id: string
          inapp_audit_reminders: boolean
          inapp_critical: boolean
          inapp_warning: boolean
          inapp_weekly_summary: boolean
          overdue_actions_trigger: number
          region: string
          score_drop_trigger: number
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amber_threshold?: number
          animations?: boolean
          compact_mode?: boolean
          created_at?: string
          css_oversight_threshold?: number
          css_reward_threshold?: number
          date_format?: string
          digest_frequency?: string
          email_audit_reminders?: boolean
          email_critical?: boolean
          email_warning?: boolean
          email_weekly_summary?: boolean
          green_threshold?: number
          id?: string
          inapp_audit_reminders?: boolean
          inapp_critical?: boolean
          inapp_warning?: boolean
          inapp_weekly_summary?: boolean
          overdue_actions_trigger?: number
          region?: string
          score_drop_trigger?: number
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amber_threshold?: number
          animations?: boolean
          compact_mode?: boolean
          created_at?: string
          css_oversight_threshold?: number
          css_reward_threshold?: number
          date_format?: string
          digest_frequency?: string
          email_audit_reminders?: boolean
          email_critical?: boolean
          email_warning?: boolean
          email_weekly_summary?: boolean
          green_threshold?: number
          id?: string
          inapp_audit_reminders?: boolean
          inapp_critical?: boolean
          inapp_warning?: boolean
          inapp_weekly_summary?: boolean
          overdue_actions_trigger?: number
          region?: string
          score_drop_trigger?: number
          theme?: string
          updated_at?: string
          user_id?: string
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
