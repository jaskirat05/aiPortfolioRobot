'use client';

import { ProjectWithSkills } from '@/app/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ScrollableCardContainerProps {
  children?: React.ReactNode;
  isVisible: boolean;
  isLoading?: boolean;
  projects?: ProjectWithSkills[];
}

const ScrollableCardContainer = ({ 
  children,
  isVisible, 
  isLoading = false,
  projects = []
}: ScrollableCardContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      setIsExpanded(e.detail);
    };

    window.addEventListener('toggleProjects', handleToggle as EventListener);
    return () => window.removeEventListener('toggleProjects', handleToggle as EventListener);
  }, []);

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
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-white/80 font-['VT323'] tracking-wide">Projects</span>
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
                <div className="p-6 h-[calc(100%-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-white/60 text-center py-8">No projects found</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {projects.map((project, index) => (
                        <div 
                          key={project.id}
                          className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-4
                                  hover:bg-gray-800/50 hover:border-white/20 transition-all duration-300"
                        >
                          <h3 className="text-white font-['VT323'] text-xl mb-2">{project.title}</h3>
                          <p className="text-white/60 font-['VT323'] text-base mb-4">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, skillIndex) => (
                              <span 
                                key={skillIndex}
                                className="bg-white/10 text-white/80 px-2 py-0.5 rounded text-sm font-['VT323']"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                          {(project.github_url || project.live_url) && (
                            <div className="flex gap-4 mt-3">
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white/60 hover:text-white transition-colors"
                                >
                                  GitHub
                                </a>
                              )}
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white/60 hover:text-white transition-colors"
                                >
                                  Live Demo
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-white/80 text-sm">projects.exe</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Content */}
      {isVisible && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20
                     transition-opacity duration-300 lg:hidden"
            aria-hidden="true"
          />
          
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 lg:hidden
                      w-[90%] md:w-[600px] h-[calc(100vh-5rem)] max-h-[600px]
                      bg-gray-800/80 backdrop-blur-sm border border-green-500/30 rounded-lg
                      transition-all duration-300 ease-in-out z-30
                      overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30">
            <div className="p-4">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center p-4"
                  >
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                ) : projects.length > 0 ? (
                  projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-green-500/30
                             text-green-400 font-['VT323']"
                    >
                      <h3 className="text-green-400 font-['VT323'] text-lg uppercase mb-2">
                        {project.title}
                      </h3>
                      <p className="text-green-400/80 font-['VT323'] text-base mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 
                                      font-['VT323'] uppercase"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                      {(project.github_url || project.live_url) && (
                        <div className="flex gap-3 mt-3">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              GitHub
                            </a>
                          )}
                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-green-400/70 font-['VT323'] text-center py-8">
                    NO PROJECTS YET.
                    <br />
                    <span className="text-sm opacity-70">
                      Ask me about my projects to see them here.
                    </span>
                  </div>
                )}
                {children}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ScrollableCardContainer;
