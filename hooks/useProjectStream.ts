import { useReducer, useCallback } from 'react';
import { StreamChunk, initialStreamingState } from '../types/streaming';
import { streamingReducer } from '../lib/streamingReducer';

export function useProjectStream() {
  const [state, dispatch] = useReducer(streamingReducer, initialStreamingState);

  const startProjectSearch = useCallback(async (query: string) => {
    dispatch({ type: 'START_STREAM', query });

    try {
      const response = await fetch('/api/search-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Search failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text and parse it
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsedChunk: StreamChunk = JSON.parse(line);
            
            switch (parsedChunk.type) {
              case 'project':
                if (parsedChunk.data?.project) {
                  dispatch({ type: 'ADD_PROJECT', project: parsedChunk.data.project });
                }
                break;
              case 'error':
                if (parsedChunk.data?.message) {
                  dispatch({ type: 'SET_ERROR', message: parsedChunk.data.message });
                }
                break;
              case 'end':
                dispatch({ type: 'END_STREAM' });
                break;
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  }, []);

  const resetStream = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    startProjectSearch,
    resetStream
  };
}
