'use client';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigateToplatform') {
        window.location.href = '/platform';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div>
      <iframe 
        src="/presentation.html" 
        width="100%" 
        height="100%" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          overflow: 'hidden'
        }}
        title="ContextLinc Presentation"
      />
    </div>
  );
}