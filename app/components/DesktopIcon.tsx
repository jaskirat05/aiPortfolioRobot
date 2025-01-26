import { motion, useDragControls } from 'framer-motion';

interface DesktopIconProps {
  name: string;
  onClick: () => void;
  iconChar?: string;
  isLoading?: boolean;
  position?: { x: number; y: number };
  onDragEnd?: (x: number, y: number) => void;
}

const DesktopIcon = ({ 
  name, 
  onClick, 
  iconChar = '📄', 
  isLoading = false,
  position = { x: 0, y: 0 },
  onDragEnd
}: DesktopIconProps) => {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      initial={position}
      animate={position}
      onDragEnd={(event, info) => {
        onDragEnd?.(info.point.x, info.point.y);
      }}
      className="absolute w-24 cursor-pointer group"
      whileDrag={{ scale: 1.05, opacity: 0.8 }}
      onDoubleClick={onClick}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl
                      flex items-center justify-center
                      shadow-[0_0_15px_rgba(255,255,255,0.15)]
                      group-hover:bg-gray-800/50 group-hover:border-white/30 
                      transition-all duration-300">
          <span className="text-3xl select-none">{iconChar}</span>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-md border border-white/20
                      group-hover:bg-gray-800/50 group-hover:border-white/30
                      flex items-center gap-2 select-none">
          <div className={`w-2.5 h-2.5 rounded-full 
                        ${isLoading 
                          ? 'bg-blue-400 animate-pulse shadow-[0_0_5px_rgba(96,165,250,0.5)]' 
                          : 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]'}`} />
          <span className="text-white font-['VT323'] text-sm whitespace-nowrap">
            {name}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DesktopIcon;
