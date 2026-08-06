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
            referencedRelation: "record_lineage"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "complaints_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          manager_role: Database["public"]["Enums"]["app_role"] | null
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          manager_role?: Database["public"]["Enums"]["app_role"] | null
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          manager_role?: Database["public"]["Enums"]["app_role"] | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      franchise_bookings: {
        Row: {
          booked_at: string
          booking_amount: number
          city: string | null
          created_by: string | null
          franchise_code: string | null
          franchisee_name: string | null
          id: string
          lead_id: string | null
          notes: string | null
        }
        Insert: {
          booked_at?: string
          booking_amount?: number
          city?: string | null
          created_by?: string | null
          franchise_code?: string | null
          franchisee_name?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
        }
        Update: {
          booked_at?: string
          booking_amount?: number
          city?: string | null
          created_by?: string | null
          franchise_code?: string | null
          franchisee_name?: string | null
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
          {
            foreignKeyName: "franchise_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["lead_id"]
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
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["lead_id"]
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
          lead_code: string | null
          lead_source: string | null
          lead_stage: string
          location_status: string | null
          meeting_date: string | null
          meeting_link: string | null
          name: string | null
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
          lead_code?: string | null
          lead_source?: string | null
          lead_stage?: string
          location_status?: string | null
          meeting_date?: string | null
          meeting_link?: string | null
          name?: string | null
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
          lead_code?: string | null
          lead_source?: string | null
          lead_stage?: string
          location_status?: string | null
          meeting_date?: string | null
          meeting_link?: string | null
          name?: string | null
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          work_item_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          work_item_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
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
            referencedRelation: "record_lineage"
            referencedColumns: ["store_id"]
          },
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
          franchise_booking_id: string | null
          id: string
          lead_id: string | null
          manager_id: string | null
          name: string
          notes: string | null
          planned_end: string | null
          planned_start: string | null
          project_code: string | null
          status: Database["public"]["Enums"]["project_status"]
          store_id: string | null
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          created_at?: string
          delayed?: boolean
          franchise_booking_id?: string | null
          id?: string
          lead_id?: string | null
          manager_id?: string | null
          name: string
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          project_code?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          created_at?: string
          delayed?: boolean
          franchise_booking_id?: string | null
          id?: string
          lead_id?: string | null
          manager_id?: string | null
          name?: string
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          project_code?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_franchise_booking_id_fkey"
            columns: ["franchise_booking_id"]
            isOneToOne: false
            referencedRelation: "franchise_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_franchise_booking_id_fkey"
            columns: ["franchise_booking_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["franchise_booking_id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "projects_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "projects_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_notes: {
        Row: {
          checklist: Json
          color: string
          content: string | null
          created_at: string
          created_by: string
          id: string
          pinned: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          checklist?: Json
          color?: string
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          pinned?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          checklist?: Json
          color?: string
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          pinned?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          city: string | null
          code: string | null
          created_at: string
          created_by: string | null
          franchise_booking_id: string | null
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          opening_date: string | null
          owner_name: string | null
          owner_phone: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["store_status"]
          store_code: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          franchise_booking_id?: string | null
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          opening_date?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          store_code?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          franchise_booking_id?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          opening_date?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          store_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_franchise_booking_id_fkey"
            columns: ["franchise_booking_id"]
            isOneToOne: false
            referencedRelation: "franchise_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_franchise_booking_id_fkey"
            columns: ["franchise_booking_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["franchise_booking_id"]
          },
          {
            foreignKeyName: "stores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "stores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["project_id"]
          },
        ]
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
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "tasks_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_related_store_id_fkey"
            columns: ["related_store_id"]
            isOneToOne: false
            referencedRelation: "record_lineage"
            referencedColumns: ["store_id"]
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
      work_assignments: {
        Row: {
          accepted_at: string | null
          assigned_by: string | null
          created_at: string
          from_user: string | null
          id: string
          missing_information: string | null
          reassign_reason: string | null
          return_reason: string | null
          returned_at: string | null
          superseded_at: string | null
          to_role: Database["public"]["Enums"]["app_role"] | null
          to_user: string | null
          work_item_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_by?: string | null
          created_at?: string
          from_user?: string | null
          id?: string
          missing_information?: string | null
          reassign_reason?: string | null
          return_reason?: string | null
          returned_at?: string | null
          superseded_at?: string | null
          to_role?: Database["public"]["Enums"]["app_role"] | null
          to_user?: string | null
          work_item_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_by?: string | null
          created_at?: string
          from_user?: string | null
          id?: string
          missing_information?: string | null
          reassign_reason?: string | null
          return_reason?: string | null
          returned_at?: string | null
          superseded_at?: string | null
          to_role?: Database["public"]["Enums"]["app_role"] | null
          to_user?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_assignments_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_attachments: {
        Row: {
          created_at: string
          external_url: string | null
          id: string
          kind: string
          label: string | null
          storage_path: string | null
          uploaded_by: string | null
          work_item_id: string
        }
        Insert: {
          created_at?: string
          external_url?: string | null
          id?: string
          kind?: string
          label?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
          work_item_id: string
        }
        Update: {
          created_at?: string
          external_url?: string | null
          id?: string
          kind?: string
          label?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_attachments_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          from_value: string | null
          id: string
          reason: string | null
          to_value: string | null
          work_item_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_value?: string | null
          id?: string
          reason?: string | null
          to_value?: string | null
          work_item_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_value?: string | null
          id?: string
          reason?: string | null
          to_value?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_events_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_handovers: {
        Row: {
          accepted_by: string | null
          created_at: string
          decided_at: string | null
          decision: Database["public"]["Enums"]["handover_state"]
          from_department: string | null
          id: string
          reason: string | null
          sent_by: string | null
          to_department: string | null
          work_item_id: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["handover_state"]
          from_department?: string | null
          id?: string
          reason?: string | null
          sent_by?: string | null
          to_department?: string | null
          work_item_id: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["handover_state"]
          from_department?: string | null
          id?: string
          reason?: string | null
          sent_by?: string | null
          to_department?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_handovers_from_department_fkey"
            columns: ["from_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "work_handovers_to_department_fkey"
            columns: ["to_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "work_handovers_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_items: {
        Row: {
          approval_required: boolean
          assigned_role: Database["public"]["Enums"]["app_role"] | null
          assigned_user: string | null
          cancelled_reason: string | null
          completed_at: string | null
          completion_summary: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          from_department: string | null
          handover_status: Database["public"]["Enums"]["handover_state"]
          id: string
          is_test: boolean
          issues_remaining: string | null
          master_code: string | null
          master_id: string | null
          master_type: Database["public"]["Enums"]["work_master_type"]
          next_action: string | null
          notes_internal: string | null
          parent_item_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          record_code: string | null
          record_type: Database["public"]["Enums"]["work_record_type"]
          required_action: string | null
          reviewed_by: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["work_status"]
          title: string
          to_department: string | null
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          assigned_user?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          from_department?: string | null
          handover_status?: Database["public"]["Enums"]["handover_state"]
          id?: string
          is_test?: boolean
          issues_remaining?: string | null
          master_code?: string | null
          master_id?: string | null
          master_type?: Database["public"]["Enums"]["work_master_type"]
          next_action?: string | null
          notes_internal?: string | null
          parent_item_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          record_code?: string | null
          record_type?: Database["public"]["Enums"]["work_record_type"]
          required_action?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          title: string
          to_department?: string | null
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          assigned_user?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          from_department?: string | null
          handover_status?: Database["public"]["Enums"]["handover_state"]
          id?: string
          is_test?: boolean
          issues_remaining?: string | null
          master_code?: string | null
          master_id?: string | null
          master_type?: Database["public"]["Enums"]["work_master_type"]
          next_action?: string | null
          notes_internal?: string | null
          parent_item_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          record_code?: string | null
          record_type?: Database["public"]["Enums"]["work_record_type"]
          required_action?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          title?: string
          to_department?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_from_department_fkey"
            columns: ["from_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "work_items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_to_department_fkey"
            columns: ["to_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      record_lineage: {
        Row: {
          booked_at: string | null
          booking_amount: number | null
          franchise_booking_id: string | null
          franchise_code: string | null
          franchisee_name: string | null
          lead_city: string | null
          lead_code: string | null
          lead_id: string | null
          lead_name: string | null
          lead_stage: string | null
          project_code: string | null
          project_id: string | null
          project_name: string | null
          project_status: Database["public"]["Enums"]["project_status"] | null
          store_code: string | null
          store_id: string | null
          store_name: string | null
          store_status: Database["public"]["Enums"]["store_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      handover_franchise_to_project: {
        Args: { _franchise_booking_id: string; _project_name?: string }
        Returns: {
          actual_end: string | null
          created_at: string
          delayed: boolean
          franchise_booking_id: string | null
          id: string
          lead_id: string | null
          manager_id: string | null
          name: string
          notes: string | null
          planned_end: string | null
          planned_start: string | null
          project_code: string | null
          status: Database["public"]["Enums"]["project_status"]
          store_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      handover_lead_to_franchise: {
        Args: { _booking_amount?: number; _lead_id: string }
        Returns: {
          booked_at: string
          booking_amount: number
          city: string | null
          created_by: string | null
          franchise_code: string | null
          franchisee_name: string | null
          id: string
          lead_id: string | null
          notes: string | null
        }
        SetofOptions: {
          from: "*"
          to: "franchise_bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      handover_project_to_store: {
        Args: { _project_id: string; _store_name?: string }
        Returns: {
          city: string | null
          code: string | null
          created_at: string
          created_by: string | null
          franchise_booking_id: string | null
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          opening_date: string | null
          owner_name: string | null
          owner_phone: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["store_status"]
          store_code: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "stores"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_leadership: { Args: { _user_id: string }; Returns: boolean }
      manages_department: {
        Args: { _dept: string; _user_id: string }
        Returns: boolean
      }
      user_department: { Args: { _user_id: string }; Returns: string }
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
        | "hr_head"
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      handover_state: "not_applicable" | "sent" | "accepted" | "returned"
      lead_status: "new" | "hot" | "warm" | "cold" | "lost" | "converted"
      notification_type:
        | "new_assignment"
        | "assignment_returned"
        | "deadline_approaching"
        | "work_overdue"
        | "information_requested"
        | "submitted_for_review"
        | "work_approved"
        | "correction_requested"
        | "handover_sent"
        | "handover_accepted"
        | "handover_returned"
        | "work_reopened"
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
      work_master_type:
        | "lead"
        | "franchise"
        | "project"
        | "store"
        | "employee"
        | "none"
      work_record_type:
        | "task"
        | "request"
        | "ticket"
        | "handover"
        | "content"
        | "payment_request"
        | "clearance"
        | "dispatch"
        | "packing"
        | "training"
        | "survey"
        | "marketing"
        | "hr"
        | "support"
      work_status:
        | "draft"
        | "submitted"
        | "assigned"
        | "accepted"
        | "in_progress"
        | "submitted_for_review"
        | "approved"
        | "completed"
        | "closed"
        | "information_required"
        | "returned"
        | "blocked"
        | "correction_required"
        | "reassigned"
        | "cancelled"
        | "reopened"
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
        "hr_head",
      ],
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      handover_state: ["not_applicable", "sent", "accepted", "returned"],
      lead_status: ["new", "hot", "warm", "cold", "lost", "converted"],
      notification_type: [
        "new_assignment",
        "assignment_returned",
        "deadline_approaching",
        "work_overdue",
        "information_requested",
        "submitted_for_review",
        "work_approved",
        "correction_requested",
        "handover_sent",
        "handover_accepted",
        "handover_returned",
        "work_reopened",
      ],
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
      work_master_type: [
        "lead",
        "franchise",
        "project",
        "store",
        "employee",
        "none",
      ],
      work_record_type: [
        "task",
        "request",
        "ticket",
        "handover",
        "content",
        "payment_request",
        "clearance",
        "dispatch",
        "packing",
        "training",
        "survey",
        "marketing",
        "hr",
        "support",
      ],
      work_status: [
        "draft",
        "submitted",
        "assigned",
        "accepted",
        "in_progress",
        "submitted_for_review",
        "approved",
        "completed",
        "closed",
        "information_required",
        "returned",
        "blocked",
        "correction_required",
        "reassigned",
        "cancelled",
        "reopened",
      ],
    },
  },
} as const
