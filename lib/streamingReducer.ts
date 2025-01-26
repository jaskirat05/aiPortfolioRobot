import { StreamingState, StreamingAction } from '../types/streaming';

export function streamingReducer(
  state: StreamingState,
  action: StreamingAction
): StreamingState {
  switch (action.type) {
    case 'START_STREAM':
      return {
        ...state,
        isLoading: true,
        isError: false,
        errorMessage: undefined,
        projects: [],
        currentQuery: action.query
      };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.project]
      };

    case 'END_STREAM':
      return {
        ...state,
        isLoading: false
      };

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        isError: true,
        errorMessage: action.message
      };

    case 'RESET':
      return {
        isLoading: false,
        isError: false,
        projects: [],
        currentQuery: ''
      };

    default:
      return state;
  }
}
