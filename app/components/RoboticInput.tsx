'use client';

import { useState } from 'react';

interface RoboticInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
}

const PREMADE_PROMPTS = [
  "Show me your projects involving NextJS",
  "What are you doing currently",
  "Tell me a personal funny story"
];

const RoboticInput = ({ placeholder = "Enter command...", onSubmit }: RoboticInputProps) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSubmit) {
        onSubmit(value);
      } else {
        console.log('Command entered:', value);
      }
      setValue('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (onSubmit) {
      onSubmit(prompt);
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
          className="w-full bg-gray-800/80 text-green-400 px-4 py-2 rounded-lg 
                     font-['VT323'] text-lg tracking-wider
                     border border-green-500
                     focus:outline-none focus:border-green-400
                     placeholder-green-600/50
                     transition-all duration-300
                     uppercase"
          style={{
            caretColor: '#4ADE80'
          }}
        />
        
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
