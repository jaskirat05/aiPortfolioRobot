'use client';

interface TextOverlayProps {
  text: string;
}

const TextOverlay = ({ text }: TextOverlayProps) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 
                    bg-gray-800/80 text-white px-6 py-3 rounded-lg 
                    font-sans z-10 shadow-lg backdrop-blur-sm">
      {text}
    </div>
  );
};

export default TextOverlay;
