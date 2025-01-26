export type Tool = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
};

export type ToolCall = {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
};

export type RoboCardData = {
  id: string;
  title: string;
  description: string;
  status?: 'success' | 'error' | 'loading';
  result?: string;
};
