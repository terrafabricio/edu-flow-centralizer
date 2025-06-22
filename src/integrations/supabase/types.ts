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
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          target_class_id: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          target_class_id?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          target_class_id?: string | null
          title?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          max_score: number
          name: string
          subject_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          max_score?: number
          name: string
          subject_id: string
          updated_at?: string
          weight?: number
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          max_score?: number
          name?: string
          subject_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          justification: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          justification?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          justification?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          coord_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          year: number
        }
        Insert: {
          coord_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          year?: number
        }
        Update: {
          coord_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_coord_id_fkey"
            columns: ["coord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      files_import_log: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          id: string
          processed_at: string | null
          status: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          id?: string
          processed_at?: string | null
          status?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          id?: string
          processed_at?: string | null
          status?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_import_log_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          attachment_url: string | null
          created_at: string
          date: string
          description: string
          id: string
          reporter_id: string
          student_id: string
          subject_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          reporter_id: string
          student_id: string
          subject_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          reporter_id?: string
          student_id?: string
          subject_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          class_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          subject_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          subject_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          subject_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      student_parent_relations: {
        Row: {
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string | null
          class_id: string
          created_at: string
          id: string
          profile_id: string
          ra: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          class_id: string
          created_at?: string
          id?: string
          profile_id: string
          ra: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          class_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          ra?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          workload_hours: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          workload_hours?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          workload_hours?: number
        }
        Relationships: []
      }
      teacher_allocations: {
        Row: {
          class_id: string
          id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          id?: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: []
      }
      teacher_subjects: {
        Row: {
          class_id: string
          created_at: string
          id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_attendance_summary: {
        Args: { p_class_id: string; p_start_date: string; p_end_date: string }
        Returns: {
          student_id: string
          student_name: string
          total_classes: number
          present_count: number
          absent_count: number
          justified_count: number
          attendance_rate: number
        }[]
      }
      fn_bimester_average: {
        Args: { p_student_id: string; p_subject_id: string; p_bimester: number }
        Returns: number
      }
      fn_final_average: {
        Args: { p_student_id: string; p_subject_id: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_coord_for_class: {
        Args: { class_id: string }
        Returns: boolean
      }
      is_student_in_class: {
        Args: { class_id: string }
        Returns: boolean
      }
      is_teacher_for_class: {
        Args: { class_id: string }
        Returns: boolean
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "justified"
      user_role: "admin" | "coord" | "teacher" | "student"
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
    Enums: {
      attendance_status: ["present", "absent", "justified"],
      user_role: ["admin", "coord", "teacher", "student"],
    },
  },
} as const
