import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 14V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 11L14 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);