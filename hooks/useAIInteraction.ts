import { useState, useCallback } from 'react';
import { ProjectWithSkills } from '@/app/types/supabase';
import { StreamChunk } from '@/types/streaming';

export function useAIInteraction() {
  const [aiResponse, setAIResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const processQuery = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setProjects([]);
      setIsTyping(false);
      setAIResponse('Analyzing your request...');

      const response = await fetch('/api/search-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'text/event-stream' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Clean up the data by removing any 'data: ' prefixes
        const cleanedValue = value.replace(/^data:\s*/gm, '').trim();
        
        if (cleanedValue.includes('PROJECT_STREAM:')) {
          try {
            let valuesToUnpack = cleanedValue.split('PROJECT_STREAM:');
            
            valuesToUnpack
              .filter(val => val.trim())
              .forEach(val => {
                try {
                  const projectData = JSON.parse(val.trim());
                  if (projectData.type === 'project' && projectData.data && projectData.data.project) {
                    setProjects(prev => [...prev, projectData.data.project]);
                  }
                } catch (parseError) {
                  console.error('Error parsing individual project:', parseError);
                }
              });
          } catch (e) {
            console.error('Error processing projects:', e);
          }
        } else if (cleanedValue.includes('MESSAGE_STREAM:')) {
          setIsTyping(true);
          const message = cleanedValue.replace('MESSAGE_STREAM:', '').trim();
          accumulatedText += message;
          console.log("Final response:", message);
          setAIResponse(accumulatedText);
          setIsTyping(false);
        }
        else if (cleanedValue.includes('ONLY_MESSAGE_STREAM:')){
          setIsTyping(true);
          const message = cleanedValue.replace('ONLY_MESSAGE_STREAM:', '').trim();
          accumulatedText += message;
          console.log("Final response:", message);
          setAIResponse(accumulatedText);
          setIsTyping(false);
        }
      }

    } catch (error) {
      console.error('Processing error:', error);
      setAIResponse('I apologize, but I encountered an error while searching for projects. Please try again.');
    } finally {
      console.log("Final response:done");
      setIsLoading(false);
      setIsTyping(false);
    }
  }, []);

  return {
    aiResponse,
    isTyping,
    projects,
    isLoading,
    processQuery,
    setIsLoading,
    setIsTyping
  };
}
