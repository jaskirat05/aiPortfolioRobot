'use client';

interface SplineViewerProps {
  url: string;
}

const SplineViewer = ({ url }: SplineViewerProps) => {
  return (
    <iframe 
      src={url}
      frameBorder='0' 
      width='100%' 
      height='100%'
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    />
  );
};

export default SplineViewer;
