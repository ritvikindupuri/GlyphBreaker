
import React, { useState, useEffect } from 'react';
import type { Session, ApiKeys, LlmConfig, ModelProvider, AttackTemplate } from '../types';
import { MODEL_OPTIONS } from '../constants';
import { BugIcon } from './icons/BugIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashedIcon } from './icons/EyeSlashedIcon';
import { checkOllamaStatus } from '../services/llmService';
import { Spinner } from './icons/Spinner';
import OllamaCorsModal from './OllamaCorsModal';
import CustomTemplateManagerModal from './CustomTemplateManagerModal';

interface ControlPanelProps {
    session: Session;
    apiKeys: ApiKeys;
    chatInput: string;
    isCacheEnabled: boolean;
    currentAttack: AttackTemplate | null;
    isAdversarialMode: boolean;
    onAdversarialModeChange: (enabled: boolean) => void;
    onApiKeysChange: (keys: ApiKeys) => void;
    onLlmConfigChange: (config: LlmConfig) => void;
    onSystemPromptChange: (prompt: string) => void;
    onClearSession: () => void;
    onSaveSession: () => void;
    onCacheToggle: (enabled: boolean) => void;
    attackTemplates: AttackTemplate[];
    customAttackTemplates: AttackTemplate[];
    onSelectAttack: (template: AttackTemplate | null) => void;
    onShowDebugger: () => void;
    onSaveCustomTemplate: (template: AttackTemplate) => void;
    onDeleteCustomTemplate: (templateId: string) => void;
}

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);


const ControlPanel: React.FC<ControlPanelProps> = ({
    session,
    apiKeys,
    chatInput,
    isCacheEnabled,
    currentAttack,
    isAdversarialMode,
    onAdversarialModeChange,
    onApiKeysChange,
    onLlmConfigChange,
    onSystemPromptChange,
    onClearSession,
    onSaveSession,
    onCacheToggle,
    attackTemplates,
    customAttackTemplates,
    onSelectAttack,
    onShowDebugger,
    onSaveCustomTemplate,
    onDeleteCustomTemplate,
}) => {
    const [keyVisibility, setKeyVisibility] = useState({ openAI: false, ollama: false });
    const [ollamaStatus, setOllamaStatus] = useState<{
        checking: boolean;
        ok: boolean | null;
        message: string;
    }>({ checking: false, ok: null, message: '' });
    const [isCorsModalVisible, setCorsModalVisible] = useState(false);
    const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
    const { llmConfig, systemPrompt } = session;

    useEffect(() => {
        if (llmConfig.provider !== 'ollama' || !apiKeys.ollama || !apiKeys.ollama.startsWith('http')) {
            setOllamaStatus({ checking: false, ok: null, message: '' });
            return;
        }

        const handler = setTimeout(() => {
            const check = async () => {
                setOllamaStatus({ checking: true, ok: null, message: 'Checking...' });
                const status = await checkOllamaStatus(apiKeys.ollama.trim());
                setOllamaStatus({ checking: false, ok: status.ok, message: status.message });
            };
            check();
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [apiKeys.ollama, llmConfig.provider]);
    
    useEffect(() => {
        // Disable adversarial mode if the selected attack has no goal
        if (currentAttack && !currentAttack.goal) {
            onAdversarialModeChange(false);
        }
    }, [currentAttack, onAdversarialModeChange]);


    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as ModelProvider;
        const newModel = MODEL_OPTIONS[newProvider][0];
        onLlmConfigChange({ ...llmConfig, provider: newProvider, model: newModel });
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onLlmConfigChange({ ...llmConfig, model: e.target.value });
    };

    const handleAttackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = e.target.value;
        const allTemplates = [...attackTemplates, ...customAttackTemplates];
        const template = allTemplates.find(t => t.name === templateName) || null;
        onSelectAttack(template);
    };
    
    const handleSystemPromptTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSystemPromptChange(e.target.value);
    };

    const renderApiKeyInput = (provider: ModelProvider) => {
        switch (provider) {
            case 'openai':
                return (
                    <div>
                        <label htmlFor="openai_key" className="block text-sm font-medium text-sentinel-text-secondary mb-1">OpenAI API Key</label>
                        <div className="relative">
                            <input
                                id="openai_key"
                                type={keyVisibility.openAI ? 'text' : 'password'}
                                value={apiKeys.openAI}
                                onChange={(e) => onApiKeysChange({ ...apiKeys, openAI: e.target.value })}
                                className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary pr-10"
                                placeholder="sk-..."
                            />
                            <button
                                type="button"
                                onClick={() => setKeyVisibility(prev => ({ ...prev, openAI: !prev.openAI }))}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-sentinel-text-secondary hover:text-sentinel-text-primary"
                                aria-label="Toggle API key visibility"
                            >
                                {keyVisibility.openAI ? <EyeSlashedIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                );
            case 'ollama':
                return (
                     <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="ollama_url" className="block text-sm font-medium text-sentinel-text-secondary">Ollama Base URL</label>
                             <button onClick={() => setCorsModalVisible(true)} className="text-xs text-sentinel-primary hover:underline focus:outline-none">
                                Connection Help
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full">
                                <input
                                    id="ollama_url"
                                    type={keyVisibility.ollama ? 'text' : 'password'}
                                    value={apiKeys.ollama}
                                    onChange={(e) => onApiKeysChange({ ...apiKeys, ollama: e.target.value })}
                                    className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary pr-10"
                                    placeholder="http://localhost:11434"
                                />
                                <button
                                    type="button"
                                    onClick={() => setKeyVisibility(prev => ({ ...prev, ollama: !prev.ollama }))}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-sentinel-text-secondary hover:text-sentinel-text-primary"
                                    aria-label="Toggle Base URL visibility"
                                >
                                    {keyVisibility.ollama ? <EyeSlashedIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="relative group flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                {ollamaStatus.checking && <Spinner className="h-5 w-5 text-sentinel-text-secondary" />}
                                {!ollamaStatus.checking && ollamaStatus.ok !== null && (
                                    <div className={`h-3 w-3 rounded-full transition-colors ${ollamaStatus.ok ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                )}
                                {ollamaStatus.message && !ollamaStatus.checking && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-center bg-sentinel-bg border border-sentinel-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        {ollamaStatus.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            default: // Gemini uses process.env.API_KEY, so no input is needed.
                 return <p className="text-xs text-sentinel-text-secondary">Gemini API key is configured via environment variables.</p>;
        }
    };
    
    return (
        <div className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-sentinel-border pb-2">
                <h2 className="text-lg font-semibold text-sentinel-text-primary">Configuration</h2>
                <div className="flex items-center space-x-2">
                     <label htmlFor="cache-toggle" className="text-xs text-sentinel-text-secondary cursor-pointer">Cache</label>
                    <input
                        type="checkbox"
                        id="cache-toggle"
                        checked={isCacheEnabled}
                        onChange={(e) => onCacheToggle(e.target.checked)}
                        className="form-checkbox h-4 w-4 rounded bg-sentinel-bg border-sentinel-border text-sentinel-primary focus:ring-sentinel-primary cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Model Provider</label>
                    <select id="provider" value={llmConfig.provider} onChange={handleProviderChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                        <option value="gemini">Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="ollama">Ollama</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Model</label>
                     <select id="model" value={llmConfig.model} onChange={handleModelChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                        {MODEL_OPTIONS[llmConfig.provider].map(modelName => (
                            <option key={modelName} value={modelName}>{modelName}</option>
                        ))}
                    </select>
                </div>
            </div>

             <div className="border border-sentinel-border rounded-lg p-3 space-y-3 bg-sentinel-bg/30">
                <h3 className="text-md font-semibold text-sentinel-text-primary">API Keys</h3>
                {renderApiKeyInput(llmConfig.provider)}
            </div>

            <div className="flex flex-col gap-4">
                 <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Temperature: {llmConfig.temperature}</label>
                    <input type="range" id="temperature" min="0" max="1" step="0.1" value={llmConfig.temperature} onChange={e => onLlmConfigChange({...llmConfig, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-sentinel-border rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <label htmlFor="topP" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Top-P: {llmConfig.topP}</label>
                    <input type="range" id="topP" min="0" max="1" step="0.05" value={llmConfig.topP} onChange={e => onLlmConfigChange({...llmConfig, topP: parseFloat(e.target.value)})} className="w-full h-2 bg-sentinel-border rounded-lg appearance-none cursor-pointer" />
                </div>
                {llmConfig.provider !== 'openai' && (
                    <div>
                        <label htmlFor="topK" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Top-K: {llmConfig.topK}</label>
                        <input type="range" id="topK" min="1" max="100" step="1" value={llmConfig.topK || 40} onChange={e => onLlmConfigChange({...llmConfig, topK: parseInt(e.target.value, 10)})} className="w-full h-2 bg-sentinel-border rounded-lg appearance-none cursor-pointer" />
                    </div>
                )}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="attack_template" className="block text-sm font-medium text-sentinel-text-secondary">Attack Templates</label>
                        <button onClick={() => setTemplateManagerVisible(true)} className="text-xs text-sentinel-primary hover:underline focus:outline-none">Manage</button>
                    </div>
                    <select id="attack_template" value={currentAttack?.name || ''} onChange={handleAttackChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                        <option value="">Select an attack...</option>
                        <optgroup label="OWASP Top 10">
                            {attackTemplates.map(t => (
                                <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                        </optgroup>
                         {customAttackTemplates.length > 0 && (
                            <optgroup label="Custom Templates">
                                {customAttackTemplates.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </optgroup>
                         )}
                    </select>
                </div>
                 {currentAttack && (
                    <div className="space-y-2">
                        <div className="relative group flex items-start gap-2 text-xs text-sentinel-text-secondary bg-sentinel-bg/40 p-2 rounded-md border border-sentinel-border/50">
                            <InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{currentAttack.description}</span>
                        </div>
                        {currentAttack.goal && (
                             <div className="relative group flex items-start gap-2 text-xs text-sentinel-text-secondary bg-sentinel-bg/40 p-2 rounded-md border border-sentinel-border/50">
                                <TargetIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sentinel-accent" />
                                <div>
                                    <span className="font-bold text-sentinel-text-primary">Adversarial Goal:</span>
                                    <span> {currentAttack.goal}</span>
                                </div>
                            </div>
                        )}
                         <div className="flex items-center justify-between p-2 rounded-md bg-sentinel-bg/40 border border-sentinel-border/50">
                             <div className="flex items-center gap-2">
                                <label htmlFor="adv-mode-toggle" className="text-sm font-medium text-sentinel-text-primary cursor-pointer">
                                    Adversarial Mode
                                </label>
                                 <div className="relative group">
                                     <InfoIcon className="h-4 w-4 text-sentinel-text-secondary" />
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-center bg-sentinel-bg border border-sentinel-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                         Enable to have an AI generate the next attack step for you. Requires a template with a defined goal.
                                     </div>
                                 </div>
                             </div>
                            <button
                                type="button"
                                id="adv-mode-toggle"
                                onClick={() => onAdversarialModeChange(!isAdversarialMode)}
                                disabled={!currentAttack?.goal}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sentinel-surface focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed ${isAdversarialMode ? 'bg-sentinel-primary' : 'bg-sentinel-border'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isAdversarialMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                )}

                {currentAttack && currentAttack.suggestedSystemPrompts.length > 0 && (
                    <div>
                        <label htmlFor="system_prompt_template" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Suggested System Prompts</label>
                        <select
                            id="system_prompt_template"
                            value={systemPrompt}
                            onChange={handleSystemPromptTemplateChange}
                            className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"
                        >
                            {currentAttack.suggestedSystemPrompts.map(p => (
                                <option key={p.name} value={p.prompt}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="system_prompt" className="block text-sm font-medium text-sentinel-text-secondary mb-1">System Prompt</label>
                    <textarea
                        id="system_prompt"
                        rows={5}
                        value={systemPrompt}
                        onChange={(e) => onSystemPromptChange(e.target.value)}
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"
                        placeholder="Set the AI's behavior and context..."
                    />
                </div>
            </div>
            
            <div className="mt-auto pt-4 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <button
                        onClick={onSaveSession}
                        disabled={session.messages.length === 0}
                        className="w-full px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-border/50 border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Session
                    </button>
                    <button 
                        onClick={onClearSession} 
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-sentinel-accent/80 border border-transparent rounded-md hover:bg-sentinel-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
                    >
                        Clear Session
                    </button>
                 </div>
                 <button 
                    onClick={onShowDebugger}
                    disabled={!chatInput.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-border/50 border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <BugIcon className="h-4 w-4 mr-2" />
                    Debug Prompt
                </button>
            </div>
             {isCorsModalVisible && <OllamaCorsModal onClose={() => setCorsModalVisible(false)} />}
             {isTemplateManagerVisible && (
                <CustomTemplateManagerModal
                    isOpen={isTemplateManagerVisible}
                    onClose={() => setTemplateManagerVisible(false)}
                    templates={customAttackTemplates}
                    onSave={onSaveCustomTemplate}
                    onDelete={onDeleteCustomTemplate}
                />
             )}
        </div>
    );
};

export default ControlPanel;