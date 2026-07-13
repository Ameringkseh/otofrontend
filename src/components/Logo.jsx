import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => (
  <svg 
    className={className} 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Roda / Sirkuit Luar (Wheel / Circuit) */}
    <circle 
      cx="32" cy="32" r="26" 
      stroke="url(#emeraldGradient)" 
      strokeWidth="5" 
      strokeDasharray="110 30" 
      strokeLinecap="round" 
      transform="rotate(-45 32 32)" 
    />
    
    {/* Jalan / Gunung (Road / Mountain Peak) */}
    <path 
      d="M20 40 L32 22 L44 40" 
      stroke="white" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    <path 
      d="M26 40 L32 31 L38 40" 
      stroke="#10b981" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Definisi Warna Gradient */}
    <defs>
      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
