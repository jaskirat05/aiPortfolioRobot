interface PreMadePromptsProps {
  onPromptClick: (prompt: string) => void;
}

const PreMadePrompts: React.FC<PreMadePromptsProps> = ({ onPromptClick }) => {
  const prompts = [
    "Show me your projects involving NextJS",
    "What are you doing currently",
    "Tell me a personal funny story"
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4 px-4 max-w-2xl mx-auto">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onPromptClick(prompt)}
          className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white
                     px-4 py-2 rounded-full text-2xl font-bold
                     border border-gray-700/50 backdrop-blur-sm
                     transition-all duration-300 cursor-pointer"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default PreMadePrompts;
