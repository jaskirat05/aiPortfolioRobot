'use client';

interface RoboCardProps {
  title: string;
  description: string;
}

const RoboCard = ({ title, description }: RoboCardProps) => {
  return (
    <div className="bg-gray-800/60 border border-green-500 rounded-lg p-4 mb-3
                    hover:bg-gray-800/80 transition-all duration-300">
      <h3 className="text-green-400 font-['VT323'] text-lg uppercase mb-2">
        {title}
      </h3>
      <p className="text-green-400/80 font-['VT323'] text-base">
        {description}
      </p>
    </div>
  );
};

export default RoboCard;
