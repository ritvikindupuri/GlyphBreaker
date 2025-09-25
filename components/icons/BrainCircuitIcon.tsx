import React from 'react';

export const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M12 2a10 10 0 0 0-3.91 19.4a2.5 2.5 0 0 1 0-2.8a2.5 2.5 0 0 1 3.9-2.6a2.5 2.5 0 0 1 3.9-2.6a2.5 2.5 0 0 1 0 2.8A10 10 0 0 0 12 2Z" />
        <path d="M12 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        <path d="M12 22a10 10 0 0 0 6.9-2.9" />
        <path d="M3.1 19.1A10 10 0 0 1 12 2a10 10 0 0 1 8.9 17.1" />
        <path d="m15 15-2 3" />
        <path d="m9 15 2 3" />
        <path d="m12 18 1-2" />
        <path d="m12 18-1-2" />
        <path d="m14 12.5.5-1" />
        <path d="m10 12.5-.5-1" />
        <path d="m17 10 1-1" />
        <path d="m7 10-1-1" />
    </svg>
);