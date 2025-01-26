'use client';

interface ToggleSwitchProps {
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
}

const ToggleSwitch = ({ isOpen, onToggle, label = 'LOG' }: ToggleSwitchProps) => {
  return (
    <button
      onClick={onToggle}
      className="bg-gray-800/80 border border-green-500 rounded-lg p-2
                text-green-400 font-['VT323'] text-sm
                hover:bg-gray-800/90 transition-all duration-300"
    >
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-400' : 'bg-gray-600'}`} />
        <span className="uppercase tracking-wider">{isOpen ? 'HIDE' : 'SHOW'} {label}</span>
      </div>
    </button>
  );
};

export default ToggleSwitch;
