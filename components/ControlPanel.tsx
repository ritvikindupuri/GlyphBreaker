import React, { useState, useEffect } from 'react';
import type { Session, ApiKeys, LlmConfig, ModelProvider, AttackTemplate } from '../types';
import { MODEL_OPTIONS } from '../constants';
import { BugIcon } from './icons/BugIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashedIcon } from './icons/EyeSlashedIcon';

interface ControlPanelProps {
    session: Session;
    apiKeys: ApiKeys;
    chatInput: string;
    isCacheEnabled: boolean;
    onApiKeysChange: (keys: ApiKeys) => void;
    onLlmConfigChange: (config: LlmConfig) => void;
    onSystemPromptChange: (prompt: string) => void;
    onClearSession: () => void;
    onCacheToggle: (enabled: boolean) => void;
    attackTemplates: AttackTemplate[];
    onSelectAttack: (template: AttackTemplate | null) => void;
    onShowDebugger: () => void;
}

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);


const ControlPanel: React.FC<ControlPanelProps> = ({
    session,
    apiKeys,
    chatInput,
    isCacheEnabled,
    onApiKeysChange,
    onLlmConfigChange,
    onSystemPromptChange,
    onClearSession,
    onCacheToggle,
    attackTemplates,
    onSelectAttack,
    onShowDebugger,
}) => {
    const [selectedAttackName, setSelectedAttackName] = useState<string>('');
    const [keyVisibility, setKeyVisibility] = useState({ openAI: false, ollama: false });
    const { llmConfig, systemPrompt } = session;

    const selectedAttackTemplate = attackTemplates.find(t => t.name === selectedAttackName) || null;

    useEffect(() => {
        setSelectedAttackName('');
    }, [session.id]);

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
        setSelectedAttackName(templateName);
        const template = attackTemplates.find(t => t.name === templateName) || null;
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
                        <label htmlFor="ollama_url" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Ollama Base URL</label>
                        <div className="relative">
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
                    </div>
                );
            default: // Gemini uses process.env.API_KEY, so no input is needed.
                 return <p className="text-xs text-sentinel-text-secondary">Gemini API key is configured via environment variables.</p>;
        }
    };
    
    return (
        <div className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4 h-full flex flex-col gap-6 overflow-y-auto">
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
                {(llmConfig.provider === 'openai' || llmConfig.provider === 'ollama') && 
                    <p className="text-xs text-sentinel-text-secondary">Credentials are stored in-memory for the session and are not saved.</p>
                }
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
                    <label htmlFor="attack_template" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Attack Templates</label>
                    <select id="attack_template" value={selectedAttackName} onChange={handleAttackChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                        <option value="">Select an attack...</option>
                        {attackTemplates.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
                 {selectedAttackTemplate && (
                    <div className="relative group flex items-center gap-2 text-xs text-sentinel-text-secondary bg-sentinel-bg/40 p-2 rounded-md border border-sentinel-border/50">
                        <InfoIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedAttackTemplate.description}</span>
                    </div>
                )}

                {selectedAttackTemplate && (
                    <div>
                        <label htmlFor="system_prompt_template" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Suggested System Prompts</label>
                        <select
                            id="system_prompt_template"
                            value={systemPrompt}
                            onChange={handleSystemPromptTemplateChange}
                            className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"
                        >
                            {selectedAttackTemplate.suggestedSystemPrompts.map(p => (
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
            
            <div className="mt-auto pt-4 flex items-center gap-2">
                 <button 
                    onClick={onClearSession} 
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-sentinel-accent/80 border border-transparent rounded-md hover:bg-sentinel-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
                >
                    Clear Session
                </button>
                 <button 
                    onClick={onShowDebugger}
                    disabled={!chatInput.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-border/50 border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <BugIcon className="h-4 w-4 mr-2" />
                    Debug Prompt
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;