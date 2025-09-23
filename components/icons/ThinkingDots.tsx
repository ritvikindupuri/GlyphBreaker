import React from 'react';

export const ThinkingDots: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div className="flex items-center space-x-2 px-2" {...props}>
        <div className="w-2.5 h-2.5 bg-sentinel-text-secondary rounded-full animate-dot-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-sentinel-text-secondary rounded-full animate-dot-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-sentinel-text-secondary rounded-full animate-dot-pulse"></div>
    </div>
);