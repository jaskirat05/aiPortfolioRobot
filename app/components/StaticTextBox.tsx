'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaticTextBoxProps {
  text: string;
  isTyping?: boolean;
  isVisible?: boolean;
}

const StaticTextBox = ({ text, isTyping = false, isVisible = true }: StaticTextBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text]);

  // Keep content visible when there's text
  useEffect(() => {
    if (text.trim() !== '') {
      setShowContent(true);
    }
  }, [text]);

  // Listen for desktop icon click
  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      if (!isTyping) { // Only allow toggling if not typing
        setIsExpanded(e.detail);
        if (e.detail) {
          setShowContent(true);
        }
      }
    };

    window.addEventListener('toggleAI', handleToggle as EventListener);
    return () => window.removeEventListener('toggleAI', handleToggle as EventListener);
  }, [isTyping]);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
                onClick={() => setIsExpanded(false)}
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%', width: 0 }}
                animate={{ x: 0, width: 500 }}
                exit={{ x: '100%', width: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="fixed right-10 bottom-[42px] h-[70vh] z-30
                        bg-black/95 backdrop-blur-md border-t border-x border-white/10 rounded-t-lg
                        overflow-hidden"
              >
                {/* Header */}
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white/80 font-['VT323'] tracking-wide">AI</span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    type="button"
                    aria-label="Close drawer"
                    className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center
                             hover:bg-red-400 transition-colors group cursor-pointer"
                  >
                    <svg 
                      className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>

                {/* Content */}
                <div className="p-6 h-[calc(100%-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20"
                     ref={scrollRef}>
                  <pre className="text-white text-xl leading-tight font-['VT323'] whitespace-pre-wrap break-words">
                    {text}
                    {isTyping && (
                      <span className="inline-block ml-1 animate-pulse">▊</span>
                    )}
                  </pre>
                </div>
              </motion.div>

              {/* Taskbar Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed right-10 bottom-0 z-30"
              >
                <div className="bg-black/95 backdrop-blur-md border border-white/10 border-t-0 rounded-b-lg 
                            w-[500px] font-['VT323']">
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse
                                shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                    <span className="text-white/80 text-sm">ai.exe</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        {/* Background Overlay - Only on mobile */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20
                     transition-opacity duration-300 lg:hidden"
          aria-hidden="true"
        />

        {/* Text Box */}
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 lg:left-auto lg:right-12 lg:translate-x-0
                      w-[90%] md:w-[600px] lg:w-[400px] z-30">
          <div className="bg-black border border-white/20 rounded-lg p-5
                         shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isTyping 
                    ? 'bg-white animate-pulse' 
                    : 'bg-white/30'
                }`} />
              </div>
              <div className="flex-grow max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2"
                   ref={scrollRef}>
                <pre className="text-white text-xl leading-tight font-['VT323'] whitespace-pre-wrap break-words">
                  {text}
                  {isTyping && (
                    <span className="inline-block ml-1 animate-pulse">▊</span>
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaticTextBox;
