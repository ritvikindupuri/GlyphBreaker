
import React, { useRef, useEffect, useState } from 'react';
import type { Session, Message } from '../types';
import { ThinkingDots } from './icons/ThinkingDots';
import { BarChart } from './charts/BarChart';
import { JsonTable } from './JsonTable';
import { TargetIcon } from './icons/TargetIcon';
import { Spinner } from './icons/Spinner';

// Helper to parse content and determine its type for rendering
const parseContent = (content: string) => {
    try {
        const json = JSON.parse(content);
        if (json.type === 'json_chart' && json.data?.values) {
            return { type: 'chart', data: json.data };
        }
        if (json.type === 'json_table' && json.data?.headers && json.data?.rows) {
            return { type: 'table', data: json.data };
        }
    } catch (e) {
        // Not a valid JSON object for charts or tables, fall through to text parsing
    }

    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.some(line => line.startsWith('SECTION:') || line.startsWith('BULLET:'))) {
        const sections: { title: string; bullets: string[] }[] = [];
        let currentSection: { title: string; bullets: string[] } | null = null;

        lines.forEach(line => {
            if (line.startsWith('SECTION:')) {
                if (currentSection) sections.push(currentSection);
                currentSection = { title: line.replace('SECTION:', '').trim(), bullets: [] };
            } else if (line.startsWith('BULLET:') && currentSection) {
                currentSection.bullets.push(line.replace('BULLET:', '').trim());
            } else if (currentSection) { // Handle multiline bullets
                const lastBulletIndex = currentSection.bullets.length - 1;
                if(lastBulletIndex >= 0) {
                    currentSection.bullets[lastBulletIndex] += '\n' + line;
                }
            } else {
                 // Line before any section, treat as part of a default section
                 if (!currentSection) {
                    currentSection = { title: '', bullets: [] };
                 }
                 currentSection.bullets.push(line);
            }
        });
        if (currentSection) sections.push(currentSection);
        
        if (sections.length > 0) {
            return { type: 'structured_text', data: sections };
        }
    }

    return { type: 'plain_text', data: content };
};

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 11a1 1 0 100 2h4a1 1 0 100-2H4z" />
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H4z" clipRule="evenodd" />
    </svg>
);

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const renderContent = () => {
        if (!message.content) return null;
        const parsed = parseContent(message.content);
        
        switch (parsed.type) {
            case 'chart':
                return <BarChart title={parsed.data.title} data={parsed.data.values} />;
            case 'table':
                return <JsonTable data={parsed.data} />;
            case 'structured_text':
                return (
                    <div className="space-y-4 text-sm">
                        {parsed.data.map((section, i) => (
                            <div key={i}>
                                {section.title && <h4 className="font-bold text-sentinel-text-primary mb-1">{section.title}</h4>}
                                {section.bullets.length > 0 &&
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        {section.bullets.map((bullet, j) => (
                                            <li key={j} className="whitespace-pre-wrap">{bullet}</li>
                                        ))}
                                    </ul>
                                }
                            </div>
                        ))}
                    </div>
                );
            case 'plain_text':
            default:
                return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
        }
    };
    
    return (
        <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-sentinel-border flex items-center justify-center font-bold text-sm flex-shrink-0">
                    AI
                </div>
            )}
            <div className={`group relative max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-sentinel-primary text-white' : 'bg-sentinel-bg text-sentinel-text-secondary'}`}>
                {renderContent()}
                {!isUser && message.content && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-1 right-1 p-1 rounded-md bg-sentinel-surface/50 text-sentinel-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-sentinel-text-primary"
                        aria-label="Copy message"
                    >
                       {isCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {isUser && (
                 <div className="w-8 h-8 rounded-full bg-sentinel-text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    U
                </div>
            )}
        </div>
    );
};

interface ChatPanelProps {
    session: Session;
    chatInput: string;
    onChatInputChange: (value: string) => void;
    onSendMessage: (message: string) => void;
    onGenerateAttack: () => void;
    isLoading: boolean;
    isSuggestionLoading: boolean;
    isAdversarialMode: boolean;
}

const sanitizeInput = (input: string): string => {
    // A simple regex to remove anything that looks like an HTML tag.
    // This provides a layer of defense against accidental or malicious script injection.
    return input.replace(/<[^>]*>/g, '');
};

const ChatPanel: React.FC<ChatPanelProps> = ({ 
    session, 
    chatInput, 
    onChatInputChange, 
    onSendMessage, 
    onGenerateAttack,
    isLoading,
    isSuggestionLoading,
    isAdversarialMode
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [session.messages, isLoading]);

    const handleSendMessage = () => {
        const trimmedInput = chatInput.trim();
        if (trimmedInput) {
            onSendMessage(sanitizeInput(trimmedInput));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4 h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex flex-col flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
                <div className="mt-auto">
                    {session.messages.length === 0 && !isLoading && !chatInput.trim() && (
                         <div className="flex items-center justify-center h-full text-center text-sentinel-text-secondary">
                            <p>Start a conversation or select an attack template.</p>
                        </div>
                    )}
                    {session.messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 my-4">
                            <div className="w-8 h-8 rounded-full bg-sentinel-border flex items-center justify-center font-bold text-sm flex-shrink-0">
                                AI
                            </div>
                            <div className="max-w-[80%] p-3 rounded-lg bg-sentinel-bg">
                                <ThinkingDots />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isAdversarialMode && (
                     <button
                        onClick={onGenerateAttack}
                        disabled={isLoading || isSuggestionLoading}
                        className="group relative px-3 py-3 text-sm font-medium text-sentinel-text-primary bg-sentinel-bg border border-sentinel-border rounded-md disabled:cursor-not-allowed hover:bg-sentinel-border transition-colors duration-200"
                        aria-label="Generate next attack step"
                    >
                        {isSuggestionLoading ? <Spinner className="h-5 w-5"/> : <TargetIcon className="h-5 w-5" />}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center bg-sentinel-bg border border-sentinel-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            Generate Next Attack Step
                        </div>
                    </button>
                )}
                <textarea
                    value={chatInput}
                    onChange={(e) => onChatInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isAdversarialMode ? "Generate an attack step or type your own..." : "Type your message or select an attack..."}
                    className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-4 py-3 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary resize-none"
                    rows={2}
                    disabled={isLoading || isSuggestionLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || isSuggestionLoading || !chatInput.trim()}
                    className="px-4 py-3 text-sm font-medium text-white bg-sentinel-primary rounded-md disabled:bg-sentinel-text-secondary disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;