export interface Database {
  public: {
    Tables: {
      user_usage: {
        Row: {
          id: string
          user_id: string
          generation_count: number
          last_reset: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_count?: number
          last_reset?: string
        }
        Update: {
          generation_count?: number
          last_reset?: string
        }
      }
    }
    Functions: {
      increment_generation_count: {
        Args: {
          p_user_id: string
        }
        Returns: void
      }
      get_user_usage: {
        Args: {
          p_user_id: string
        }
        Returns: {
          generation_count: number
          last_reset: string
          remaining_generations: number
        }[]
      }
    }
  }
} 