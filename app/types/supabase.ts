export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string
          github_url: string | null
          live_url: string | null
          created_at: string
          updated_at: string
          search_vector: number[] | null
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
      }
      project_skills: {
        Row: {
          project_id: string
          skill_id: string
          relevance_score: number
        }
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
  }
}

// Convenient type aliases
export interface Project {
  id: string
  title: string
  description: string
  github_url: string | null
  live_url: string | null
  created_at: string
  updated_at: string
  search_vector: number[] | null
}

export interface Skill {
  id: string
  name: string
  category: string
  created_at: string
}

export interface ProjectSkill {
  project_id: string
  skill_id: string
  relevance_score: number
}

export interface ProjectWithSkills extends Project {
  skills: (Pick<Skill, 'id' | 'name' | 'category'> & { relevance_score: number })[]
}

export interface SearchResult {
  project: ProjectWithSkills
  relevance: number
}
