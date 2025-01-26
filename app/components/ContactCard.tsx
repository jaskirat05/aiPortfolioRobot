import React from 'react';

interface ContactCardProps {
  isVisible: boolean;
  onClose: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
      <div className="bg-black/80 border border-white rounded-lg p-4 lg:p-6 w-[300px] lg:w-[400px] relative
                    hover:bg-black/90 transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 lg:top-4 right-3 lg:right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close contact card"
        >
          ✕
        </button>
        <h3 className="text-white font-['VT323'] text-xl lg:text-2xl uppercase mb-3 lg:mb-4">
          Contact Information
        </h3>
        <div className="space-y-2 lg:space-y-3">
          <p className="text-gray-300 font-['VT323'] text-base lg:text-lg">
            <span className="text-white">Name:</span> Jaskirat Singh
          </p>
          <p className="text-gray-300 font-['VT323'] text-base lg:text-lg">
            <span className="text-white">Phone:</span> (647) 671-7845
          </p>
          <p className="text-gray-300 font-['VT323'] text-base lg:text-lg">
            <span className="text-white">Email:</span>{' '}
            <a href="mailto:jaskirat055@gmail.com" className="hover:text-white">
              jaskirat055@gmail.com
            </a>
          </p>
          <p className="text-gray-300 font-['VT323'] text-base lg:text-lg">
            <span className="text-white">Location:</span> Toronto, ON
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
