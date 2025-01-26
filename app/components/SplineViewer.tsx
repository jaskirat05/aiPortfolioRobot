'use client';

import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

interface SplineViewerProps {
  url: string;
}

const SplineViewer = ({ url }: SplineViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splineRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Spline
    const spline = new Application(canvasRef.current);
    splineRef.current = spline;
    
    // Load the scene
    spline.load(url)
      .then(() => {
        console.log('Spline scene loaded');
        // Ensure canvas is properly sized after load
        if (canvasRef.current) {
          canvasRef.current.style.width = '100%';
          canvasRef.current.style.height = '100%';
        }
      })
      .catch(console.error);

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.style.width = '100%';
        canvasRef.current.style.height = '100%';
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (splineRef.current) {
        splineRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block', // Remove any default spacing
          margin: 'auto',   // Center the canvas
          objectFit: 'contain', // Maintain aspect ratio
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
    </div>
  );
};

export default SplineViewer;
