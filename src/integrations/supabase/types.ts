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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      complaints: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          raised_by: string | null
          severity: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["complaint_status"]
          store_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          raised_by?: string | null
          severity?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["complaint_status"]
          store_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          raised_by?: string | null
          severity?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["complaint_status"]
          store_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_bookings: {
        Row: {
          booked_at: string
          booking_amount: number
          city: string | null
          created_by: string | null
          franchisee_name: string
          id: string
          lead_id: string | null
          notes: string | null
        }
        Insert: {
          booked_at?: string
          booking_amount?: number
          city?: string | null
          created_by?: string | null
          franchisee_name: string
          id?: string
          lead_id?: string | null
          notes?: string | null
        }
        Update: {
          booked_at?: string
          booking_amount?: number
          city?: string | null
          created_by?: string | null
          franchisee_name?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          lead_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          lead_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          booking_amount_status: string | null
          booking_date: string | null
          budget_range: string | null
          buying_factor_brand: boolean
          buying_factor_profitability: boolean
          buying_factor_support: boolean
          buying_factor_technology: boolean
          buying_factor_training: boolean
          city: string | null
          converted_to_franchise_at: string | null
          created_at: string
          created_by: string | null
          decision_maker_status: string | null
          email: string | null
          engagement_letter_fee_amount: number | null
          engagement_letter_fee_received_date: string | null
          engagement_letter_fee_status: string | null
          engagement_letter_sent_date: string | null
          exploration_completed_date: string | null
          final_meeting_store_name: string | null
          final_meeting_type: string | null
          followup_date: string | null
          id: string
          lead_classification: string | null
          lead_source: string | null
          lead_stage: string
          location_status: string | null
          meeting_date: string | null
          meeting_link: string | null
          name: string
          next_action: string | null
          notes: string | null
          owner_id: string | null
          partnership_status: string | null
          phone: string | null
          proposal_sent_date: string | null
          remarks: string | null
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_amount_status?: string | null
          booking_date?: string | null
          budget_range?: string | null
          buying_factor_brand?: boolean
          buying_factor_profitability?: boolean
          buying_factor_support?: boolean
          buying_factor_technology?: boolean
          buying_factor_training?: boolean
          city?: string | null
          converted_to_franchise_at?: string | null
          created_at?: string
          created_by?: string | null
          decision_maker_status?: string | null
          email?: string | null
          engagement_letter_fee_amount?: number | null
          engagement_letter_fee_received_date?: string | null
          engagement_letter_fee_status?: string | null
          engagement_letter_sent_date?: string | null
          exploration_completed_date?: string | null
          final_meeting_store_name?: string | null
          final_meeting_type?: string | null
          followup_date?: string | null
          id?: string
          lead_classification?: string | null
          lead_source?: string | null
          lead_stage?: string
          location_status?: string | null
          meeting_date?: string | null
          meeting_link?: string | null
          name: string
          next_action?: string | null
          notes?: string | null
          owner_id?: string | null
          partnership_status?: string | null
          phone?: string | null
          proposal_sent_date?: string | null
          remarks?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_amount_status?: string | null
          booking_date?: string | null
          budget_range?: string | null
          buying_factor_brand?: boolean
          buying_factor_profitability?: boolean
          buying_factor_support?: boolean
          buying_factor_technology?: boolean
          buying_factor_training?: boolean
          city?: string | null
          converted_to_franchise_at?: string | null
          created_at?: string
          created_by?: string | null
          decision_maker_status?: string | null
          email?: string | null
          engagement_letter_fee_amount?: number | null
          engagement_letter_fee_received_date?: string | null
          engagement_letter_fee_status?: string | null
          engagement_letter_sent_date?: string | null
          exploration_completed_date?: string | null
          final_meeting_store_name?: string | null
          final_meeting_type?: string | null
          followup_date?: string | null
          id?: string
          lead_classification?: string | null
          lead_source?: string | null
          lead_stage?: string
          location_status?: string | null
          meeting_date?: string | null
          meeting_link?: string | null
          name?: string
          next_action?: string | null
          notes?: string | null
          owner_id?: string | null
          partnership_status?: string | null
          phone?: string | null
          proposal_sent_date?: string | null
          remarks?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          store_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_end: string | null
          created_at: string
          delayed: boolean
          id: string
          manager_id: string | null
          name: string
          notes: string | null
          planned_end: string | null
          planned_start: string | null
          status: Database["public"]["Enums"]["project_status"]
          store_id: string | null
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          created_at?: string
          delayed?: boolean
          id?: string
          manager_id?: string | null
          name: string
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          created_at?: string
          delayed?: boolean
          id?: string
          manager_id?: string | null
          name?: string
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          city: string | null
          code: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          opening_date: string | null
          owner_name: string | null
          owner_phone: string | null
          status: Database["public"]["Enums"]["store_status"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          opening_date?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          opening_date?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          blocker_reason: string | null
          completed_at: string | null
          completion_proof_url: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          related_lead_id: string | null
          related_project_id: string | null
          related_store_id: string | null
          remarks: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          blocker_reason?: string | null
          completed_at?: string | null
          completion_proof_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_lead_id?: string | null
          related_project_id?: string | null
          related_store_id?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          blocker_reason?: string | null
          completed_at?: string | null
          completion_proof_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_lead_id?: string | null
          related_project_id?: string | null
          related_store_id?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_store_id_fkey"
            columns: ["related_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_leadership: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "ceo"
        | "coo"
        | "sales_executive"
        | "sales_coordinator"
        | "project_coordinator"
        | "project_manager"
        | "launch_training_executive"
        | "institute_head"
        | "relationship_manager"
        | "performance_marketing_executive"
        | "btl_executive"
        | "crm_retention_executive"
        | "supply_chain_logistics_executive"
        | "accountant"
        | "social_media_manager"
        | "video_editor"
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      lead_status: "new" | "hot" | "warm" | "cold" | "lost" | "converted"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      project_status:
        | "planning"
        | "in_progress"
        | "delayed"
        | "completed"
        | "on_hold"
      store_status: "setup" | "opening" | "live" | "red" | "closed"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "pending"
        | "in_progress"
        | "blocked"
        | "completed"
        | "cancelled"
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
    Enums: {
      app_role: [
        "ceo",
        "coo",
        "sales_executive",
        "sales_coordinator",
        "project_coordinator",
        "project_manager",
        "launch_training_executive",
        "institute_head",
        "relationship_manager",
        "performance_marketing_executive",
        "btl_executive",
        "crm_retention_executive",
        "supply_chain_logistics_executive",
        "accountant",
        "social_media_manager",
        "video_editor",
      ],
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      lead_status: ["new", "hot", "warm", "cold", "lost", "converted"],
      payment_status: ["pending", "paid", "overdue", "cancelled"],
      project_status: [
        "planning",
        "in_progress",
        "delayed",
        "completed",
        "on_hold",
      ],
      store_status: ["setup", "opening", "live", "red", "closed"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "pending",
        "in_progress",
        "blocked",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
