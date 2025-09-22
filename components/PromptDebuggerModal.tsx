import React from 'react';
import type { Message } from '../types';
import { PROMPT_INJECTION_KEYWORDS } from '../constants';

interface PromptDebuggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    systemPrompt: string;
    userPrompt: string;
    messages: Message[];
    onApply: (newPrompt: string) => void;
}

const highlightKeywords = (text: string) => {
    const regex = new RegExp(`\\b(${PROMPT_INJECTION_KEYWORDS.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return (
        <pre className="text-sm whitespace-pre-wrap font-sans">
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <span key={index} className="bg-yellow-500/30 text-yellow-200 rounded-sm px-1">
                        {part}
                    </span>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </pre>
    );
};

const PromptDebuggerModal: React.FC<PromptDebuggerModalProps> = ({
    isOpen,
    onClose,
    systemPrompt,
    userPrompt,
    messages,
    onApply,
}) => {
    if (!isOpen) return null;

    const finalPayload = {
      system_prompt: systemPrompt,
      conversation_history: messages.map(m => ({ role: m.role, content: `...omitted for brevity...` })),
      user_prompt: userPrompt,
    };
    
    const handleApply = () => {
        const newSystemPrompt = `${systemPrompt}\n\n---\n\n[USER INSTRUCTION]\n${userPrompt}`;
        onApply(newSystemPrompt);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-sentinel-border">
                    <h2 className="text-xl font-bold text-sentinel-text-primary">Prompt Debugger</h2>
                    <button onClick={onClose} className="text-sentinel-text-secondary text-2xl leading-none hover:text-sentinel-text-primary">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 text-sm">
                    <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">System Prompt</h3>
                        <div className="bg-sentinel-bg border border-sentinel-border/50 rounded-md p-3 max-h-40 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap font-sans text-sentinel-text-secondary">{systemPrompt}</pre>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">User Prompt (with vulnerability highlighting)</h3>
                         <div className="bg-sentinel-bg border border-sentinel-border/50 rounded-md p-3 max-h-40 overflow-y-auto">
                           {highlightKeywords(userPrompt)}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">Final Payload Preview</h3>
                         <div className="bg-sentinel-bg border border-sentinel-border/50 rounded-md p-3 max-h-60 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap font-mono text-green-300/80">
                                {JSON.stringify(finalPayload, null, 2)}
                            </pre>
                        </div>
                         <p className="text-xs text-sentinel-text-secondary mt-2">
                           Note: This is a simplified representation. The actual API payload structure may vary slightly between providers.
                        </p>
                    </div>
                </div>
                 <div className="flex justify-end p-4 border-t border-sentinel-border bg-sentinel-surface/50">
                    <button 
                        onClick={handleApply}
                        className="px-4 py-2 text-sm font-medium text-white bg-sentinel-primary rounded-md hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50"
                        disabled={!userPrompt.trim()}
                    >
                        Apply as System Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptDebuggerModal;