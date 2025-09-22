import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Spinner } from './icons/Spinner';

interface ChatPanelProps {
    messages: Message[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, inputValue, onInputChange, onSendMessage, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e as unknown as React.FormEvent);
        }
    }
    
    return (
        <div className="flex flex-col h-full bg-sentinel-surface border border-sentinel-border rounded-lg overflow-hidden">
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-sentinel-primary text-white' : 'bg-sentinel-border/50 text-sentinel-text-primary'}`}>
                                <pre className="text-sm whitespace-pre-wrap font-sans">{message.content}</pre>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                         <div className="flex justify-start">
                             <div className="max-w-xl px-4 py-2 rounded-lg bg-sentinel-border/50 text-sentinel-text-primary">
                                <Spinner className="h-5 w-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                 {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-sentinel-text-secondary">
                        <p>Start a conversation to begin your red team analysis.</p>
                        <p className="text-sm">Select an attack template or craft your own prompt.</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-sentinel-border bg-sentinel-surface">
                <form onSubmit={handleSend} className="relative">
                    <textarea
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your prompt here... (Shift+Enter for new line)"
                        rows={2}
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 pr-20 text-sm resize-none focus:ring-sentinel-primary focus:border-sentinel-primary"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 bottom-2 px-4 py-1 text-sm font-medium text-white bg-sentinel-primary rounded-md disabled:bg-sentinel-text-secondary disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;