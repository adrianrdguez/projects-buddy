import { useState, useEffect } from 'react';

interface LoadingTextProps {
  className?: string;
}

const loadingMessages = [
  'Thinking',
  'Creating project',
  'Generating tasks'
];

export function LoadingText({ className = '' }: LoadingTextProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-end gap-1 ${className}`}>
      <span>{loadingMessages[currentMessageIndex]}</span>
      <div className="flex gap-0.5 pb-0.5">
        <span 
          className="w-1 h-1 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        ></span>
        <span 
          className="w-1 h-1 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
        ></span>
        <span 
          className="w-1 h-1 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
        ></span>
      </div>
    </div>
  );
}