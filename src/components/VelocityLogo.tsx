import React from 'react';

interface VelocityLogoProps {
  size?: number;
  className?: string;
}

const VelocityLogo: React.FC<VelocityLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        
        {/* Abstract V shape with dynamic lines */}
        <path
          d="M8 12 L20 32 L32 12"
          stroke="url(#velocityGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Speed lines */}
        <path
          d="M4 8 L12 8"
          stroke="url(#velocityGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M6 14 L14 14"
          stroke="url(#velocityGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M2 20 L10 20"
          stroke="url(#velocityGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};

export default VelocityLogo;