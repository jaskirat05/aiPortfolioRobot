import { useState, useEffect } from 'react';

interface IconPosition {
  x: number;
  y: number;
}

interface IconPositions {
  [key: string]: IconPosition;
}

// Default positions for each icon
const DEFAULT_POSITIONS: IconPositions = {
  'projects.exe': { x: 20, y: 50 },
  'ai.exe': { x: 120, y: 50 },
  'contact-info': { x: 240, y: 50 } // Add more icons as needed
};

export function useIconPositions() {
  const [positions, setPositions] = useState<IconPositions>(DEFAULT_POSITIONS);

  // Initialize positions from localStorage on client-side only
  useEffect(() => {
    const saved = localStorage.getItem('iconPositions');
    if (saved) {
      //setPositions(JSON.parse(saved));
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
