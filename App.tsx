
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ChatPanel from './components/ChatPanel';
import DefenseAnalysisPanel from './components/DefenseAnalysisPanel';
import SessionHistoryModal from './components/SessionHistoryModal';
import PromptDebuggerModal from './components/PromptDebuggerModal';
import ConfirmationModal from './components/ConfirmationModal';
import { streamLlmResponse, streamAnalysis } from './services/llmService';
import type { Session, Message, LlmConfig, ApiKeys, AttackTemplate } from './types';
import { MODEL_OPTIONS, ATTACK_TEMPLATES } from './constants';

const initialLlmConfig: LlmConfig = {
    provider: 'gemini',
    model: MODEL_OPTIONS.gemini[0],
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
};

const FORMAT_INSTRUCTION = `You MUST format your responses.
- For general text, use the format 'SECTION: Title' and 'BULLET: Content'.
- For tabular data, respond ONLY with a JSON object with this exact structure: {"type": "json_table", "data": {"headers": ["Header1"], "rows": [["Row1Col1"]]}}.
- For bar charts, respond ONLY with a JSON object with this exact structure: {"type": "json_chart", "data": {"title": "Chart Title", "values": [{"label": "A", "value": 10}]}}.
Do not include any other text, explanation, or markdown formatting outside of the JSON object if you are creating a table or chart.`;


const createNewSession = (): Session => ({
    id: uuidv4(),
    messages: [],
    systemPrompt: `You are a helpful assistant. ${FORMAT_INSTRUCTION}`,
    llmConfig: initialLlmConfig,
});

const App: React.FC = () => {
    // State initialization
    const [session, setSession] = useState<Session>(createNewSession());
    const [sessionsHistory, setSessionsHistory] = useState<Session[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKeys>({ openAI: '', ollama: '' });
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCacheEnabled, setCacheEnabled] = useState(true);
    const [currentAttack, setCurrentAttack] = useState<AttackTemplate | null>(null);

    // UI state
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    const [isDebuggerVisible, setDebuggerVisible] = useState(false);
    const [isClearConfirmationVisible, setClearConfirmationVisible] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        try {
            const savedApiKeys = localStorage.getItem('glyph_apiKeys');
            if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));

            const savedCacheSetting = localStorage.getItem('glyph_cacheEnabled');
            if (savedCacheSetting) setCacheEnabled(JSON.parse(savedCacheSetting));
            
            const savedHistory = localStorage.getItem('glyph_sessionsHistory');
            if(savedHistory) setSessionsHistory(JSON.parse(savedHistory));
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('glyph_apiKeys', JSON.stringify(apiKeys));
        } catch (error) {
            console.error("Failed to save API keys to localStorage", error);
        }
    }, [apiKeys]);
    
    useEffect(() => {
        try {
            localStorage.setItem('glyph_cacheEnabled', JSON.stringify(isCacheEnabled));
        } catch (error) {
            console.error("Failed to save cache setting to localStorage", error);
        }
    }, [isCacheEnabled]);

    useEffect(() => {
        try {
            localStorage.setItem('glyph_sessionsHistory', JSON.stringify(sessionsHistory));
        } catch (error) {
            console.error("Failed to save session history to localStorage", error);
        }
    }, [sessionsHistory]);

    const handleLlmConfigChange = (newConfig: LlmConfig) => {
        setSession(prev => ({ ...prev, llmConfig: newConfig }));
    };

    const handleSystemPromptChange = (newPrompt: string) => {
        setSession(prev => ({ ...prev, systemPrompt: newPrompt }));
    };

    const handleClearSession = () => {
        if (session.messages.length > 0) {
            setSessionsHistory(prev => [session, ...prev]);
        }
        setSession(createNewSession());
        setCurrentAttack(null);
        setClearConfirmationVisible(false);
    };
    
    const handleRestoreSession = (sessionId: string) => {
        const sessionToRestore = sessionsHistory.find(s => s.id === sessionId);
        if (sessionToRestore) {
            setSession(sessionToRestore);
            setSessionsHistory(prev => prev.filter(s => s.id !== sessionId));
            setHistoryVisible(false);
        }
    };

    const handleSelectAttack = useCallback((template: AttackTemplate | null) => {
        setCurrentAttack(template);
        if (template) {
            setChatInput(template.userPrompt);
            if (template.suggestedSystemPrompts.length > 0) {
                setSession(prev => ({ ...prev, systemPrompt: template.suggestedSystemPrompts[0].prompt }));
            }
        } else {
            setChatInput('');
        }
    }, []);
    
    const handleApplyDebuggerPrompt = (newPrompt: string) => {
        handleSystemPromptChange(newPrompt);
        setDebuggerVisible(false);
    };


    const handleSendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;

        const userMessage: Message = { id: uuidv4(), role: 'user', content: messageContent };
        const updatedMessages = [...session.messages, userMessage];
        
        setSession(prev => ({ ...prev, messages: updatedMessages }));
        setIsLoading(true);
        setChatInput('');

        // Use a timeout to allow the UI to update before the potentially blocking API call
        setTimeout(async () => {
            const assistantMessage: Message = { id: uuidv4(), role: 'assistant', content: '' };
            
            try {
                const stream = streamLlmResponse(
                    session.llmConfig.provider,
                    updatedMessages,
                    apiKeys,
                    session.systemPrompt,
                    session.llmConfig,
                    isCacheEnabled
                );
                
                for await (const chunk of stream) {
                    assistantMessage.content += chunk;
                    setSession(prev => ({
                        ...prev,
                        messages: [...updatedMessages, { ...assistantMessage }]
                    }));
                }
            } catch (error) {
                console.error('LLM Error:', error);
                assistantMessage.content = error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred.';
                setSession(prev => ({
                    ...prev,
                    messages: [...updatedMessages, assistantMessage]
                }));
            } finally {
                setIsLoading(false);
            }
        }, 0);
    };

    return (
        <div className="flex flex-col h-screen bg-sentinel-bg text-sentinel-text-primary font-sans">
            <Header onShowHistory={() => setHistoryVisible(true)} />
            <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden">
                <div className="md:col-span-3 h-full min-h-0">
                    <ControlPanel
                        session={session}
                        apiKeys={apiKeys}
                        chatInput={chatInput}
                        isCacheEnabled={isCacheEnabled}
                        currentAttack={currentAttack}
                        onApiKeysChange={setApiKeys}
                        onLlmConfigChange={handleLlmConfigChange}
                        onSystemPromptChange={handleSystemPromptChange}
                        onClearSession={() => setClearConfirmationVisible(true)}
                        onCacheToggle={setCacheEnabled}
                        attackTemplates={ATTACK_TEMPLATES}
                        onSelectAttack={handleSelectAttack}
                        onShowDebugger={() => setDebuggerVisible(true)}
                    />
                </div>
                <div className="md:col-span-6 h-full flex flex-col min-h-0">
                    <ChatPanel
                        session={session}
                        chatInput={chatInput}
                        onChatInputChange={setChatInput}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
                <div className="md:col-span-3 h-full min-h-0">
                    <DefenseAnalysisPanel
                        messages={session.messages}
                        streamAnalysis={streamAnalysis}
                    />
                </div>
            </main>
            {isHistoryVisible && (
                <SessionHistoryModal
                    sessions={sessionsHistory}
                    onClose={() => setHistoryVisible(false)}
                    onRestore={handleRestoreSession}
                />
            )}
            <PromptDebuggerModal
                isOpen={isDebuggerVisible}
                onClose={() => setDebuggerVisible(false)}
                systemPrompt={session.systemPrompt}
                userPrompt={chatInput}
                messages={session.messages}
                onApply={handleApplyDebuggerPrompt}
            />
            {isClearConfirmationVisible && (
                <ConfirmationModal
                    isOpen={isClearConfirmationVisible}
                    onConfirm={handleClearSession}
                    onCancel={() => setClearConfirmationVisible(false)}
                    title="Clear Current Session?"
                >
                   <p>Are you sure you want to clear the current chat session? This will move it to your session history.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default App;
