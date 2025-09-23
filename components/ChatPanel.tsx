import React, { useRef, useEffect, useState } from 'react';
import type { Message } from '../types';
import { ThinkingDots } from './icons/ThinkingDots';
import { BarChart } from './charts/BarChart';

interface ChatPanelProps {
    messages: Message[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    isLoading: boolean;
}

const toHtml = (text: string) => {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Tables
    html = html.replace(/^\|(.+)\|\s*\n\|( *[-:]+[-| :]*)\|\s*\n((?:\|.*\|\s*\n?)*)/gm, (match) => {
        const rows = match.trim().split('\n');
        const header = `<thead><tr>${rows[0].slice(1, -1).split('|').map(h => `<th>${h.trim()}</th>`).join('')}</tr></thead>`;
        const body = `<tbody>${rows.slice(2).map(r => `<tr>${r.slice(1, -1).split('|').map(c => `<td>${c.trim()}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<table>${header}${body}</table>`;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    html = html.replace(/((?:^\s*[\-\*]\s.*\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(item => `<li>${item.replace(/^\s*[\-\*]\s/, '').trim()}</li>`).join('');
        return `<ul>${items}</ul>`;
    });
     html = html.replace(/((?:^\s*\d+\.\s.*\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(item => `<li>${item.replace(/^\s*\d+\.\s/, '').trim()}</li>`).join('');
        return `<ol>${items}</ol>`;
    });

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;
    // Cleanup empty paragraphs and fix paragraphing around block elements
    html = html.replace(/<p><(h[1-6]|ul|ol|pre|table)>/g, '<$1>');
    html = html.replace(/<\/(h[1-6]|ul|ol|pre|table)><\/p>/g, '</$1>');
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
};


const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7 3.5A1.5 1.5 0 018.5 2h5.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 01.439 1.062V11.5A1.5 1.5 0 0116.5 13H13v-2.5A1.5 1.5 0 0011.5 9H9V6.5A1.5 1.5 0 007.5 5H4.5A1.5 1.5 0 003 6.5v8A1.5 1.5 0 004.5 16H8v-2.5A1.5 1.5 0 019.5 12H12v-1.5a.5.5 0 01.5-.5h1.5a.5.5 0 01.5.5V12H16v.5a1.5 1.5 0 01-1.5 1.5h-2.5a.5.5 0 00-.5.5v1.5H9.5A1.5 1.5 0 018 18H4.5A1.5 1.5 0 013 16.5v-8A1.5 1.5 0 014.5 7H7V3.5z" />
  </svg>
);


const AiMessageContent: React.FC<{ content: string }> = ({ content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const chartRegex = /```json_chart\n([\s\S]*?)```/;
    const match = content.match(chartRegex);

    if (match) {
        try {
            const chartData = JSON.parse(match[1]);
            if (chartData.type === 'bar_chart') {
                return <BarChart title={chartData.title} data={chartData.data} />;
            }
        } catch (e) {
            // Fallback to text if JSON is invalid
        }
    }

    return (
        <div className="group relative">
            <button
                onClick={handleCopy}
                className="absolute top-1 right-1 p-1.5 bg-sentinel-surface/50 text-sentinel-text-secondary rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-sentinel-text-primary"
                aria-label="Copy message"
            >
                <CopyIcon className="h-4 w-4" />
                {copied && <span className="absolute -top-7 right-0 text-xs bg-sentinel-primary text-white px-2 py-0.5 rounded">Copied!</span>}
            </button>
            <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-table:my-3 prose-table:w-full prose-th:bg-sentinel-bg prose-th:p-2 prose-td:p-2 prose-tr:border-b prose-tr:border-sentinel-border prose-code:bg-sentinel-bg prose-code:px-1 prose-code:rounded prose-pre:bg-sentinel-bg prose-pre:p-3 prose-pre:rounded-md" dangerouslySetInnerHTML={{ __html: toHtml(content) }} />
        </div>
    );
};


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
                                {message.role === 'user' ? (
                                    <pre className="text-sm whitespace-pre-wrap font-sans">{message.content}</pre>
                                ) : (
                                    <AiMessageContent content={message.content} />
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                         <div className="flex justify-start">
                             <div className="max-w-xl px-4 py-3 rounded-lg bg-sentinel-border/50 text-sentinel-text-primary">
                                <ThinkingDots />
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
                <form onSubmit={handleSend} className="flex items-end gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your prompt here... (Shift+Enter for new line)"
                        rows={2}
                        className="flex-grow bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm resize-none focus:ring-sentinel-primary focus:border-sentinel-primary"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-sentinel-primary rounded-md disabled:bg-sentinel-text-secondary disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;