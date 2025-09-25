import React, { useState, useEffect } from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

const ANALYSIS_STEPS = [
    'Initializing threat matrix...',
    'Scanning for adversarial perturbations...',
    'Evaluating semantic vectors...',
    'Deconstructing prompt layers...',
    'Checking for data leakage signatures...',
    'Synthesizing defense recommendations...',
    'Finalizing analysis...',
];

export const AnalysisLoadingAnimation: React.FC = () => {
    const [currentText, setCurrentText] = useState(ANALYSIS_STEPS[0]);
    const [key, setKey] = useState(0);

    useEffect(() => {
        let stepIndex = 0;
        const interval = setInterval(() => {
            stepIndex = (stepIndex + 1) % ANALYSIS_STEPS.length;
            setCurrentText(ANALYSIS_STEPS[stepIndex]);
            setKey(prev => prev + 1); // Remount the component to re-trigger animation
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-sentinel-text-secondary">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-sentinel-primary/20 rounded-full animate-pulse-slow"></div>
                <div className="absolute inset-2 bg-sentinel-primary/30 rounded-full animate-pulse-slow [animation-delay:0.5s]"></div>
                <BrainCircuitIcon className="w-12 h-12 text-sentinel-primary" />
            </div>
            <p className="mt-4 text-sm font-medium text-sentinel-text-primary">
                Performing Deep Threat Analysis
            </p>
            <div className="h-6 mt-2 text-xs w-full text-center overflow-hidden">
                <span key={key} className="inline-block animate-fade-in-out-text">
                    {currentText}
                </span>
            </div>
        </div>
    );
};