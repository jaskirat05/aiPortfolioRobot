'use client';

import { useState } from 'react';
import './RoboticInput.css';

interface RoboticInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => Promise<void>;
}

const PREMADE_PROMPTS = [
  "Show me your projects involving NextJS",
  "What are you doing currently",
  "Tell me a personal funny story"
];

const RoboticInput = ({ placeholder = "Enter command...", onSubmit }: RoboticInputProps) => {
  const [value, setValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSubmit) {
        setIsTyping(true);
        onSubmit(value).finally(() => setIsTyping(false));
      } else {
        console.log('Command entered:', value);
      }
      setValue('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (onSubmit) {
      setIsTyping(true);
      onSubmit(prompt).finally(() => setIsTyping(false));
    }
  };

  return (
    <div className="fixed top-[60%] left-1/2 transform -translate-x-1/2 w-full px-4">
      <div className="w-full max-w-2xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isTyping}
          className={`w-full bg-gray-800/80 text-green-400 px-4 py-2 rounded-lg 
                     font-['VT323'] text-lg tracking-wider
                     border border-green-500 ${isTyping ? 'border-breathe' : ''}`}
          style={{
            caretColor: '#4ADE80'
          }}
        />
        {isTyping && <span className="text-green-400">Loading...</span>}
        
        {/* Pre-made prompts */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 w-full">
          {PREMADE_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="bg-gray-900/80 hover:bg-gray-800/80 text-gray-300 hover:text-white
                       px-3 py-1.5 rounded-full text-sm font-['VT323'] font-bold
                       border border-gray-800/50 backdrop-blur-sm
                       transition-all duration-300 cursor-pointer
                       whitespace-nowrap text-center"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoboticInput;
