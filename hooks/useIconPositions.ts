import { useState, useEffect } from 'react';

interface IconPosition {
  x: number;
  y: number;
}

interface IconPositions {
  [key: string]: IconPosition;
}

const getInitialPositions = (): IconPositions => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      'projects.exe': { x: 20, y: 50 },
      'ai.exe': { x: 120, y: 50 },
      'contact-info': { x: 240, y: 50 }
    };
  }

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const iconSpacing = 120;
  const centerY: number = Math.floor(screenH * 0.05);
  const centerX: number = Math.floor(screenW / 2 - 50);

  return {
    'projects.exe': { x: centerX - iconSpacing, y: centerY },
    'ai.exe': { x: centerX, y: centerY },
    'contact-info': { x: centerX + iconSpacing, y: centerY }
  };
};

// Default positions for each icon
const DEFAULT_POSITIONS: IconPositions = {
  'projects.exe': getInitialPositions()['projects.exe'],
  'ai.exe': getInitialPositions()['ai.exe'],
  'contact-info': getInitialPositions()['contact-info']
};

export function useIconPositions() {
  const [positions, setPositions] = useState<IconPositions>(DEFAULT_POSITIONS);

  // Initialize positions from localStorage on client-side only
  useEffect(() => {
    const saved = localStorage.getItem('iconPositions');
    if (saved) {
      setPositions(JSON.parse(saved));
    }
  }, []);

  // Save positions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('iconPositions', JSON.stringify(positions));
  }, [positions]);

  const updatePosition = (iconName: string, x: number, y: number) => {
    setPositions(prev => ({
      ...prev,
      [iconName]: { x, y }
    }));
  };

  const getPosition = (iconName: string): IconPosition => {
    return positions[iconName] || { x: 0, y: 0 };
  };

  return { positions, updatePosition, getPosition };
}
