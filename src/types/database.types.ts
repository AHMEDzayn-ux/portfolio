// Generated via `npx supabase gen types typescript --project-id yplupxzkkgqxabdtskga --schema public`
// then hand-tightened: status/category/type columns are CHECK-constrained, not
// Postgres enums, so codegen emits `string` — narrowed here to match the checks
// in supabase/migrations/0001_init.sql. Re-run generation if the schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          issuer: string | null
          sort_order: number
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          issuer?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          issuer?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          date: string
          description: string | null
          id: string
          image_url: string
          issuer: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          date: string
          description?: string | null
          id?: string
          image_url: string
          issuer?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string
          issuer?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string
          location: string | null
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution: string
          location?: string | null
          sort_order?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string
          location?: string | null
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          org: string
          role: string
          sort_order: number
          start_date: string
          type: "work" | "education"
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          org: string
          role: string
          sort_order?: number
          start_date: string
          type: "work" | "education"
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          org?: string
          role?: string
          sort_order?: number
          start_date?: string
          type?: "work" | "education"
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string
          email: string | null
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          resume_url: string | null
          short_tagline: string
          telegram_url: string | null
          title: string
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          email?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          resume_url?: string | null
          short_tagline?: string
          telegram_url?: string | null
          title?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          email?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          resume_url?: string | null
          short_tagline?: string
          telegram_url?: string | null
          title?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          featured: boolean
          hero: { url: string; type: "image" | "video" } | null
          id: string
          image_url: string | null
          live_url: string | null
          long_description: string | null
          media: { url: string; type: "image" | "video" }[]
          repo_url: string | null
          slug: string
          sort_order: number
          status: "draft" | "published"
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          featured?: boolean
          hero?: { url: string; type: "image" | "video" } | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          long_description?: string | null
          media?: { url: string; type: "image" | "video" }[]
          repo_url?: string | null
          slug: string
          sort_order?: number
          status?: "draft" | "published"
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          featured?: boolean
          hero?: { url: string; type: "image" | "video" } | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          long_description?: string | null
          media?: { url: string; type: "image" | "video" }[]
          repo_url?: string | null
          slug?: string
          sort_order?: number
          status?: "draft" | "published"
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          authors: string
          created_at: string
          description: string | null
          id: string
          publication_date: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
          url: string | null
          venue: string | null
        }
        Insert: {
          authors: string
          created_at?: string
          description?: string | null
          id?: string
          publication_date: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          url?: string | null
          venue?: string | null
        }
        Update: {
          authors?: string
          created_at?: string
          description?: string | null
          id?: string
          publication_date?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: "languages" | "frameworks" | "databases" | "ai" | "cloud" | "design" | "tools" | "other" | "engineering"
          created_at: string
          icon: string | null
          id: string
          level: number | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: "languages" | "frameworks" | "databases" | "ai" | "cloud" | "design" | "tools" | "other" | "engineering"
          created_at?: string
          icon?: string | null
          id?: string
          level?: number | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: "languages" | "frameworks" | "databases" | "ai" | "cloud" | "design" | "tools" | "other" | "engineering"
          created_at?: string
          icon?: string | null
          id?: string
          level?: number | null
          name?: string
          sort_order?: number
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
