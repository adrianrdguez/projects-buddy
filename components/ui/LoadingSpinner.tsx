interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="animate-spin"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      >
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .line {
              animation: fade 1.2s linear infinite;
            }
            .line:nth-child(1) { animation-delay: 0s; }
            .line:nth-child(2) { animation-delay: 0.1s; }
            .line:nth-child(3) { animation-delay: 0.2s; }
            .line:nth-child(4) { animation-delay: 0.3s; }
            .line:nth-child(5) { animation-delay: 0.4s; }
            .line:nth-child(6) { animation-delay: 0.5s; }
            .line:nth-child(7) { animation-delay: 0.6s; }
            .line:nth-child(8) { animation-delay: 0.7s; }
            .line:nth-child(9) { animation-delay: 0.8s; }
            .line:nth-child(10) { animation-delay: 0.9s; }
            .line:nth-child(11) { animation-delay: 1.0s; }
            .line:nth-child(12) { animation-delay: 1.1s; }
            @keyframes fade {
              0%, 39%, 100% { opacity: 0.2; }
              40% { opacity: 1; }
            }
          `}
        </style>
        
        {/* 12 lines like a clock */}
        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="17.66" y1="4.34" x2="15.48" y2="6.52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="22" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="17.66" y1="19.66" x2="15.48" y2="17.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="12" y1="22" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="6.34" y1="19.66" x2="8.52" y2="17.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="6.34" y1="4.34" x2="8.52" y2="6.52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="18.36" y1="5.64" x2="16.95" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="18.36" y1="18.36" x2="16.95" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="5.64" y1="18.36" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
        <line x1="5.64" y1="5.64" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="line" />
      </svg>
    </div>
  );
}