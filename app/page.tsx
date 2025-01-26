'use client';

import { useState, useEffect } from 'react';
import SplineViewer from './components/SplineViewer';
import RoboticInput from './components/RoboticInput';
import StaticTextBox from './components/StaticTextBox';
import ScrollableCardContainer from './components/ScrollableCardContainer';
import ToggleSwitch from './components/ToggleSwitch';
import DesktopIcon from './components/DesktopIcon';
import ContactCard from './components/ContactCard';
import { useAIInteraction } from '@/hooks/useAIInteraction';
import { useIconPositions } from '@/hooks/useIconPositions';

export default function Home() {
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [isAIVisible, setIsAIVisible] = useState(true);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const { aiResponse, isTyping, projects, isLoading, processQuery } = useAIInteraction();
  const { getPosition, updatePosition } = useIconPositions();

  // Handle desktop icon clicks
  useEffect(() => {
    const handleProjectsToggle = (e: CustomEvent) => {
      setIsLogVisible(e.detail);
      if (e.detail) {
        // If opening projects, close AI
        setIsAIVisible(false);
        const aiEvent = new CustomEvent('toggleAI', { detail: false });
        window.dispatchEvent(aiEvent);
      }
    };

    const handleAIToggle = (e: CustomEvent) => {
      setIsAIVisible(e.detail);
      if (e.detail) {
        // If opening AI, close projects
        setIsLogVisible(false);
        const projectsEvent = new CustomEvent('toggleProjects', { detail: false });
        window.dispatchEvent(projectsEvent);
      }
    };

    window.addEventListener('toggleProjects', handleProjectsToggle as EventListener);
    window.addEventListener('toggleAI', handleAIToggle as EventListener);
    return () => {
      window.removeEventListener('toggleProjects', handleProjectsToggle as EventListener);
      window.removeEventListener('toggleAI', handleAIToggle as EventListener);
    };
  }, [isLoading]);

  const handleCommand = async (command: string) => {
    setIsLogVisible(true);
    setIsAIVisible(false);
    await processQuery(command);
    // After processing is complete, open AI drawer
    const aiEvent = new CustomEvent('toggleAI', { detail: true });
    window.dispatchEvent(aiEvent);
  };

  const toggleLogs = () => {
    setIsLogVisible(!isLogVisible);
    if (!isLogVisible) {
      setIsAIVisible(false);
    }
  };

  const toggleAI = () => {
    setIsAIVisible(!isAIVisible);
    if (!isAIVisible) {
      setIsLogVisible(false);
    }
  };

  const toggleContact = () => {
    setIsContactVisible(!isContactVisible);
  };

  return (
    <main className="w-screen h-screen relative overflow-hidden">
      <SplineViewer url='/scene.splinecode' />
      
      {/* Desktop Icons Container */}
      <div className="hidden lg:block fixed inset-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <DesktopIcon
            name="contact-info"
            iconChar="📇"
            isLoading={isLoading}
            position={getPosition('contact-info')}
            onDragEnd={(x, y) => updatePosition('contact-info', x, y)}
            onClick={() => {
              setIsContactVisible(!isContactVisible);
            }}
          />
          <DesktopIcon
            name="projects.exe"
            iconChar="📂"
            isLoading={isLoading}
            position={getPosition('projects.exe')}
            onDragEnd={(x, y) => updatePosition('projects.exe', x, y)}
            onClick={() => {
              const projectsEvent = new CustomEvent('toggleProjects', { detail: true });
              window.dispatchEvent(projectsEvent);
            }}
          />
          <DesktopIcon 
            name="ai.exe"
            iconChar="🤖"
            isLoading={isLoading}
            position={getPosition('ai.exe')}
            onDragEnd={(x, y) => updatePosition('ai.exe', x, y)}
            onClick={() => {
              const aiEvent = new CustomEvent('toggleAI', { detail: true });
              window.dispatchEvent(aiEvent);
            }}
          />
        </div>
      </div>

      {/* Fixed position containers for toggles */}
      <div className="fixed top-0 left-0 right-0 p-5 flex justify-between z-20">
        {/* Left side - Logs toggle (hidden on lg) */}
        <div className="lg:hidden">
          <ToggleSwitch 
            isOpen={isLogVisible} 
            onToggle={toggleLogs}
            label="LOGS" 
          />
        </div>

        {/* Right side - AI toggle (mobile only) */}
        <div className="lg:hidden">
          <ToggleSwitch 
            isOpen={isAIVisible} 
            onToggle={toggleAI}
            label="AI" 
          />
        </div>
      </div>
      
      {/* Mobile Toggles */}
      <div className="lg:hidden flex flex-col gap-2 absolute bottom-4 right-4">
        <ToggleSwitch
          isOpen={isContactVisible}
          onToggle={toggleContact}
          label="CONTACT"
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {/* StaticTextBox */}
          <StaticTextBox 
            text={aiResponse || "SYSTEM ONLINE. READY FOR QUERIES."} 
            isTyping={isTyping}
            isVisible={isAIVisible}
          />

          <ScrollableCardContainer 
            isVisible={isLogVisible}
            isLoading={isLoading}
            projects={projects}
          />

          <RoboticInput 
            placeholder="Ask about my projects..." 
            onSubmit={handleCommand}
          />

          {/* Contact Card */}
          <ContactCard isVisible={isContactVisible} onClose={() => setIsContactVisible(false)} />
        </div>
      </div>
    </main>
  );
}
