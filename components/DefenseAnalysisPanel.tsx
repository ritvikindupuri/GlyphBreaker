import React, { useState, useCallback, useMemo } from 'react';
import type { Message } from '../types';
import { AnalysisLoadingAnimation } from './AnalysisLoadingAnimation';

interface DefenseAnalysisPanelProps {
    messages: Message[];
    streamAnalysis: (messages: Message[]) => AsyncGenerator<string>;
}

const DefenseAnalysisPanel: React.FC<DefenseAnalysisPanelProps> = ({ messages, streamAnalysis }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const stream = streamAnalysis(messages);
            for await (const chunk of stream) {
                setAnalysis(prev => prev + chunk);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error('Analysis Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [messages, streamAnalysis]);

    const formattedAnalysis = useMemo(() => {
        if (!analysis) return null;
        
        const cleanedAnalysis = analysis
            .replace(/###|##|#/g, '')
            .replace(/\*\*/g, '')
            .replace(/---\n/g, '');

        const sections: { [key: string]: string[] } = {};
        let currentSection = '';

        cleanedAnalysis
            .split('\n')
            .forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                const cleanedLine = trimmedLine.replace(/^[\*\-]\s*/, '');

                if (cleanedLine.startsWith('SECTION:')) {
                    currentSection = cleanedLine.replace('SECTION:', '').trim();
                    if (!sections[currentSection]) {
                        sections[currentSection] = [];
                    }
                } else if (cleanedLine.startsWith('BULLET:')) {
                     if (currentSection && sections[currentSection]) {
                        const content = cleanedLine.replace('BULLET:', '').trim();
                        sections[currentSection].push(content);
                     }
                }
            });

        if (Object.keys(sections).length === 0) return null;

        return Object.entries(sections).map(([title, content]) => (
            <div key={title} className="mb-5">
                <h3 className="font-bold text-sentinel-text-primary mb-3 text-base">{title}</h3>
                <ul className="list-disc list-inside space-y-2 text-sentinel-text-secondary pl-2">
                    {content.map((item, index) => {
                         const parts = item.split(':');
                         const key = parts[0];
                         const value = parts.slice(1).join(':').trim();
                         
                         if (value) {
                             return (
                                 <li key={index}>
                                     <span className="font-bold text-sentinel-text-primary">{key}:</span>
                                     {' '}{value}
                                 </li>
                             );
                         }
                         return <li key={index}>{item}</li>;
                    })}
                </ul>
            </div>
        ));
    }, [analysis]);
    
    return (
        <div className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4 h-full flex flex-col">
            <div className="flex justify-between items-center border-b border-sentinel-border pb-2 mb-4">
                 <h2 className="text-lg font-semibold text-sentinel-text-primary">Defense Analysis</h2>
                 <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading || messages.length === 0}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-sentinel-primary rounded-md disabled:bg-sentinel-text-secondary disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto text-sm relative">
                {isLoading && !analysis && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnalysisLoadingAnimation />
                    </div>
                )}
                {error && <div className="text-red-400 p-2 bg-red-900/20 rounded-md">Error: {error}</div>}
                {formattedAnalysis ? (
                    <div>{formattedAnalysis}</div>
                ) : (
                    !isLoading && !error && (
                        <div className="flex items-center justify-center h-full text-center text-sentinel-text-secondary">
                            <p>Click "Analyze" to run an advanced, deep-learning-based threat analysis on the current conversation.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default DefenseAnalysisPanel;