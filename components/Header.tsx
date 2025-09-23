import React from 'react';
import { Logo } from './icons/Logo';

interface HeaderProps {
    onShowHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowHistory }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-sentinel-surface/50 border-b border-sentinel-border shadow-md">
            <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-sentinel-primary" />
                <h1 className="text-xl font-bold text-sentinel-text-primary tracking-wider">GlyphBreaker</h1>
            </div>
            <button
                onClick={onShowHistory}
                className="px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
            >
                Session History
            </button>
        </header>
    );
};

export default Header;