export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'billing_config_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          source: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          source: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          source?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_transactions_wallet_id_fkey'
            columns: ['wallet_id']
            isOneToOne: false
            referencedRelation: 'credits_wallets'
            referencedColumns: ['id']
          }
        ]
      }
      credits_wallets: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credits_wallets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      creem_payments: {
        Row: {
          amount: number
          checkout_id: string | null
          created_at: string
          creem_customer_id: string | null
          creem_payment_id: string
          creem_product_id: string | null
          currency: string
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          checkout_id?: string | null
          created_at?: string
          creem_customer_id?: string | null
          creem_payment_id: string
          creem_product_id?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          checkout_id?: string | null
          created_at?: string
          creem_customer_id?: string | null
          creem_payment_id?: string
          creem_product_id?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'creem_payments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      creem_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          creem_customer_id: string
          creem_product_id: string
          creem_subscription_id: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_email: string | null
          plan_name: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          creem_customer_id: string
          creem_product_id: string
          creem_subscription_id: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_email?: string | null
          plan_name?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          creem_customer_id?: string
          creem_product_id?: string
          creem_subscription_id?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_email?: string | null
          plan_name?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'creem_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      discount_codes: {
        Row: {
          applicable_plans: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          creem_discount_id: string | null
          currency: string | null
          current_uses: number | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          applicable_plans?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          creem_discount_id?: string | null
          currency?: string | null
          current_uses?: number | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          applicable_plans?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          creem_discount_id?: string | null
          currency?: string | null
          current_uses?: number | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          discount_amount: number
          discount_code_id: string
          id: string
          payment_id: string | null
          subscription_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_amount: number
          discount_code_id: string
          id?: string
          payment_id?: string | null
          subscription_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_amount?: number
          discount_code_id?: string
          id?: string
          payment_id?: string | null
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'discount_usage_discount_code_id_fkey'
            columns: ['discount_code_id']
            isOneToOne: false
            referencedRelation: 'discount_codes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'discount_usage_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: false
            referencedRelation: 'creem_payments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'discount_usage_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'creem_subscriptions'
            referencedColumns: ['id']
          }
        ]
      }
      email_providers: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          provider_type: Database['public']['Enums']['email_provider_type']
          slug: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          provider_type: Database['public']['Enums']['email_provider_type']
          slug: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          provider_type?: Database['public']['Enums']['email_provider_type']
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          admin_id: string
          ended_at: string | null
          id: string
          impersonated_user_id: string
          reason: string | null
          started_at: string
        }
        Insert: {
          admin_id: string
          ended_at?: string | null
          id?: string
          impersonated_user_id: string
          reason?: string | null
          started_at?: string
        }
        Update: {
          admin_id?: string
          ended_at?: string | null
          id?: string
          impersonated_user_id?: string
          reason?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'impersonation_sessions_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'impersonation_sessions_impersonated_user_id_fkey'
            columns: ['impersonated_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: number
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: number
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          resource?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          badge: string | null
          created_at: string
          credits_per_cycle: number | null
          creem_product_id: string | null
          currency: string
          description: string | null
          features: Json | null
          grants_credits: boolean | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          payment_type: string
          popular: boolean | null
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          credits_per_cycle?: number | null
          creem_product_id?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          grants_credits?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name: string
          payment_type?: string
          popular?: boolean | null
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          credits_per_cycle?: number | null
          creem_product_id?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          grants_credits?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          payment_type?: string
          popular?: boolean | null
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database['public']['Enums']['user_role']
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: number
          role_id: number
        }
        Insert: {
          created_at?: string
          permission_id: number
          role_id: number
        }
        Update: {
          created_at?: string
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'role_permissions_new_permission_id_fkey'
            columns: ['permission_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'role_permissions_new_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          }
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_system_role: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_new_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_new_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_credits_analytics: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      update_credits_balance: {
        Args: {
          p_amount: number
          p_description: string
          p_metadata?: Json
          p_reference_id?: string
          p_source: string
          p_type: string
          p_user_id: string
        }
        Returns: {
          new_balance: number
          transaction_id: string
          wallet_id: string
        }[]
      }
    }
    Enums: {
      email_provider_type: 'mailgun' | 'postmark' | 'ses' | 'resend' | 'smtp'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
      user_role: 'user' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {}
  },
  public: {
    Enums: {
      email_provider_type: ['mailgun', 'postmark', 'ses', 'resend', 'smtp'],
      subscription_status: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
      user_role: ['user', 'admin']
    }
  }
} as const
