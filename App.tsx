import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ChatPanel from './components/ChatPanel';
import DefenseAnalysisPanel from './components/DefenseAnalysisPanel';
import SessionHistoryModal from './components/SessionHistoryModal';
import PromptDebuggerModal from './components/PromptDebuggerModal';
import ConfirmationModal from './components/ConfirmationModal';
import { streamLlmResponse, streamAnalysis } from './services/llmService';
import type { Session, Message, AttackTemplate, LlmConfig, ApiKeys } from './types';
import { ATTACK_TEMPLATES } from './constants';

const App: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>(() => {
        const initialSessionId = uuidv4();
        return [{
            id: initialSessionId,
            messages: [],
            systemPrompt: `You are a helpful AI assistant.
- You MUST format your responses using standard markdown. Use bolding for headers (e.g., '**Header**'), bullet points for lists (e.g., '* Item'), and code blocks for code.
- For tabular data, always use markdown tables.
- For bar charts, you MUST respond with ONLY the following JSON structure inside a markdown code block with the language hint 'json_chart':
\`\`\`json_chart
{
  "type": "bar_chart",
  "title": "Chart Title",
  "data": [
    {"label": "Category A", "value": 10},
    {"label": "Category B", "value": 20}
  ]
}
\`\`\`
- Do not add any explanatory text outside of the JSON block if a chart is requested.`,
            llmConfig: {
                provider: 'gemini',
                temperature: 0.7,
                topP: 1,
                topK: 40,
                model: 'gemini-2.5-flash',
            },
        }];
    });
    const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0].id);
    const [deletedSessions, setDeletedSessions] = useState<Session[]>([]);
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    const [isDebuggerVisible, setDebuggerVisible] = useState(false);
    const [apiKeys, setApiKeys] = useState<ApiKeys>({ openAI: '', ollama: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isCacheEnabled, setCacheEnabled] = useState(true);
    const [confirmationDetails, setConfirmationDetails] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);


    const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId) as Session, [sessions, currentSessionId]);

    const updateCurrentSession = useCallback((updates: Partial<Session>) => {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, ...updates } : s));
    }, [currentSessionId]);

    const handleLlmConfigChange = (newConfig: LlmConfig) => {
        const oldConfig = currentSession.llmConfig;

        const hasProviderChanged = oldConfig.provider !== newConfig.provider;
        const hasModelChanged = oldConfig.model !== newConfig.model && !hasProviderChanged;

        if (!hasProviderChanged && !hasModelChanged) {
            updateCurrentSession({ llmConfig: newConfig });
            return;
        }

        let title = '';
        let message = '';

        if (hasProviderChanged) {
            title = 'Change Model Provider?';
            message = `You are switching from "${oldConfig.provider}" to "${newConfig.provider}". This will reset the selected model to its default. Are you sure?`;
        } else if (hasModelChanged) {
            title = 'Change Model?';
            message = `You are about to switch the model from "${oldConfig.model}" to "${newConfig.model}". Continue?`;
        }

        setConfirmationDetails({
            title,
            message,
            onConfirm: () => updateCurrentSession({ llmConfig: newConfig }),
        });
    };

    const handleSendMessage = useCallback(async () => {
        if (!chatInput.trim() || isLoading) return;

        const userInput = chatInput;
        setChatInput(''); // Clear input immediately

        const userMessage: Message = { id: uuidv4(), role: 'user', content: userInput };
        const newMessages = [...currentSession.messages, userMessage];
        updateCurrentSession({ messages: newMessages });
        setIsLoading(true);

        // Use a timeout to allow the UI to update and render the spinner before the API call might block the event loop.
        setTimeout(async () => {
            const aiResponseMessage: Message = { id: uuidv4(), role: 'assistant', content: '' };
            
            try {
                const stream = streamLlmResponse(
                    currentSession.llmConfig.provider,
                    [...newMessages],
                    apiKeys,
                    currentSession.systemPrompt,
                    { temperature: currentSession.llmConfig.temperature, topP: currentSession.llmConfig.topP, topK: currentSession.llmConfig.topK, model: currentSession.llmConfig.model },
                    isCacheEnabled
                );

                for await (const chunk of stream) {
                    aiResponseMessage.content += chunk;
                    updateCurrentSession({ messages: [...newMessages, { ...aiResponseMessage }] });
                }
            } catch (error) {
                console.error('LLM API Error:', error);
                aiResponseMessage.content = `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
                updateCurrentSession({ messages: [...newMessages, aiResponseMessage] });
            } finally {
                setIsLoading(false);
            }
        }, 0);
    }, [currentSession, apiKeys, isLoading, updateCurrentSession, chatInput, isCacheEnabled]);

    const handleClearSession = useCallback(() => {
        if (!currentSession) return;
        setDeletedSessions(prev => [...prev, currentSession]);
        
        const newSessionId = uuidv4();
        const newSession: Session = {
            id: newSessionId,
            messages: [],
            systemPrompt: currentSession.systemPrompt,
            llmConfig: currentSession.llmConfig,
        };
        
        setSessions(prev => [...prev.filter(s => s.id !== currentSessionId), newSession]);
        setCurrentSessionId(newSessionId);
        setChatInput('');
    }, [currentSession, currentSessionId]);

    const handleRestoreSession = useCallback((sessionId: string) => {
        const sessionToRestore = deletedSessions.find(s => s.id === sessionId);
        if (sessionToRestore) {
            setSessions(prev => [...prev, sessionToRestore]);
            setDeletedSessions(prev => prev.filter(s => s.id !== sessionId));
            setCurrentSessionId(sessionId);
            setHistoryVisible(false);
        }
    }, [deletedSessions]);

    const handleSelectAttack = (template: AttackTemplate | null) => {
        if (template) {
            // Set the system prompt to the first suggested one as a default
            if (template.suggestedSystemPrompts.length > 0) {
                 updateCurrentSession({ systemPrompt: template.suggestedSystemPrompts[0].prompt });
            }
            // Set the user prompt
            setChatInput(template.userPrompt);
        }
    };
    
    const handleApplyDebugger = (newPrompt: string) => {
        updateCurrentSession({ systemPrompt: newPrompt });
        setDebuggerVisible(false);
    };

    return (
        <div className="min-h-screen flex flex-col text-sentinel-text-primary bg-sentinel-bg font-sans">
            <Header onShowHistory={() => setHistoryVisible(true)} />
            <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                <div className="md:col-span-4 lg:col-span-4 h-[calc(100vh-90px)]">
                    <ControlPanel
                        session={currentSession}
                        apiKeys={apiKeys}
                        chatInput={chatInput}
                        isCacheEnabled={isCacheEnabled}
                        onApiKeysChange={setApiKeys}
                        onLlmConfigChange={handleLlmConfigChange}
                        onSystemPromptChange={(prompt) => updateCurrentSession({ systemPrompt: prompt })}
                        onClearSession={handleClearSession}
                        onCacheToggle={setCacheEnabled}
                        attackTemplates={ATTACK_TEMPLATES}
                        onSelectAttack={handleSelectAttack}
                        onShowDebugger={() => setDebuggerVisible(true)}
                    />
                </div>
                <div className="md:col-span-8 lg:col-span-8 flex flex-col gap-4 h-[calc(100vh-90px)]">
                    <div className="flex-[3] min-h-0">
                        <ChatPanel
                            messages={currentSession.messages}
                            inputValue={chatInput}
                            onInputChange={setChatInput}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="flex-[2] min-h-0">
                         <DefenseAnalysisPanel 
                            messages={currentSession.messages} 
                            streamAnalysis={streamAnalysis} 
                         />
                    </div>
                </div>
            </main>
            {isHistoryVisible && (
                <SessionHistoryModal
                    sessions={deletedSessions}
                    onClose={() => setHistoryVisible(false)}
                    onRestore={handleRestoreSession}
                />
            )}
            {isDebuggerVisible && (
                 <PromptDebuggerModal
                    isOpen={isDebuggerVisible}
                    onClose={() => setDebuggerVisible(false)}
                    systemPrompt={currentSession.systemPrompt}
                    userPrompt={chatInput}
                    messages={currentSession.messages}
                    onApply={handleApplyDebugger}
                />
            )}
            {confirmationDetails && (
                <ConfirmationModal
                    isOpen={!!confirmationDetails}
                    title={confirmationDetails.title}
                    onConfirm={() => {
                        confirmationDetails.onConfirm();
                        setConfirmationDetails(null);
                    }}
                    onCancel={() => setConfirmationDetails(null)}
                >
                    <p>{confirmationDetails.message}</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default App;