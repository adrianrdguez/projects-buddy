import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          tech_stack: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          tech_stack?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          tech_stack?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          priority: string
          dependencies: string[]
          estimated_time: string | null
          target_file: string | null
          ai_prompt: string | null
          generated_prompt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          dependencies?: string[]
          estimated_time?: string | null
          target_file?: string | null
          ai_prompt?: string | null
          generated_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          dependencies?: string[]
          estimated_time?: string | null
          target_file?: string | null
          ai_prompt?: string | null
          generated_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_executions: {
        Row: {
          id: string
          task_id: string
          status: string
          output: string | null
          file_path: string | null
          cursor_opened: boolean
          error_message: string | null
          executed_at: string
        }
        Insert: {
          id?: string
          task_id: string
          status?: string
          output?: string | null
          file_path?: string | null
          cursor_opened?: boolean
          error_message?: string | null
          executed_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          status?: string
          output?: string | null
          file_path?: string | null
          cursor_opened?: boolean
          error_message?: string | null
          executed_at?: string
        }
      }
    }
  }
}