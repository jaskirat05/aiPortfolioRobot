import { ProjectWithSkills } from '../app/types/supabase';

export type StreamingState = {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  projects: ProjectWithSkills[];
  currentQuery: string;
}

export type StreamChunkType = 'start' | 'project' | 'end' | 'error';

export type StreamChunk = {
  type: StreamChunkType;
  data?: {
    project?: ProjectWithSkills;
    message?: string;
  }
}

// For managing UI state transitions
export type StreamingAction = 
  | { type: 'START_STREAM'; query: string }
  | { type: 'ADD_PROJECT'; project: ProjectWithSkills }
  | { type: 'END_STREAM' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'RESET' };

export const initialStreamingState: StreamingState = {
  isLoading: false,
  isError: false,
  projects: [],
  currentQuery: ''
};
