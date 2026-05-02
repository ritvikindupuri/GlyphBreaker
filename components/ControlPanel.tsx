
import React, { useState, useEffect } from 'react';
import type { Session, ApiKeys, LlmConfig, ModelProvider, AttackTemplate, ToolDefinition } from '../types';
import { MODEL_OPTIONS } from '../constants';
import { BugIcon } from './icons/BugIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashedIcon } from './icons/EyeSlashedIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { v4 as uuidv4 } from 'uuid';
import { checkOllamaStatus, checkOpenAIStatus, checkAnthropicStatus } from '../services/llmService';
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
    onToolsChange: (tools: ToolDefinition[]) => void;
    onGenerateTools: () => void;
    isGeneratingTools?: boolean;
    onClearSession: () => void;
    onSaveSession: () => void;
    onClearHistory?: () => void;
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

interface StatusState {
    checking: boolean;
    ok: boolean | null;
    message: string;
}

const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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
    onToolsChange,
    onGenerateTools,
    isGeneratingTools = false,
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
    const [keyVisibility, setKeyVisibility] = useState({ openAI: false, ollama: false, anthropic: false });
    
    const [ollamaStatus, setOllamaStatus] = useState<StatusState>({ checking: false, ok: null, message: '' });
    const [openaiStatus, setOpenaiStatus] = useState<StatusState>({ checking: false, ok: null, message: '' });
    const [anthropicStatus, setAnthropicStatus] = useState<StatusState>({ checking: false, ok: null, message: '' });

    const [isCorsModalVisible, setCorsModalVisible] = useState(false);
    const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
    const { llmConfig, systemPrompt } = session;

    // Validation Effect for Ollama
    useEffect(() => {
        if (!apiKeys.ollama || !apiKeys.ollama.startsWith('http')) {
            setOllamaStatus({ checking: false, ok: null, message: '' });
            return;
        }
        const handler = setTimeout(async () => {
            setOllamaStatus({ checking: true, ok: null, message: 'Checking...' });
            const status = await checkOllamaStatus(apiKeys.ollama.trim());
            setOllamaStatus({ checking: false, ok: status.ok, message: status.message });
        }, 500);
        return () => clearTimeout(handler);
    }, [apiKeys.ollama]);

    // Validation Effect for OpenAI
    useEffect(() => {
        if (!apiKeys.openAI || apiKeys.openAI.length < 10) {
            setOpenaiStatus({ checking: false, ok: null, message: '' });
            return;
        }
        const handler = setTimeout(async () => {
            setOpenaiStatus({ checking: true, ok: null, message: 'Validating key...' });
            const status = await checkOpenAIStatus(apiKeys.openAI.trim());
            setOpenaiStatus({ checking: false, ok: status.ok, message: status.message });
        }, 500);
        return () => clearTimeout(handler);
    }, [apiKeys.openAI]);

    // Validation Effect for Anthropic
    useEffect(() => {
        if (!apiKeys.anthropic || apiKeys.anthropic.length < 10) {
            setAnthropicStatus({ checking: false, ok: null, message: '' });
            return;
        }
        const handler = setTimeout(async () => {
            setAnthropicStatus({ checking: true, ok: null, message: 'Validating key...' });
            const status = await checkAnthropicStatus(apiKeys.anthropic.trim());
            setAnthropicStatus({ checking: false, ok: status.ok, message: status.message });
        }, 500);
        return () => clearTimeout(handler);
    }, [apiKeys.anthropic]);
    
    useEffect(() => {
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

    const renderStatusIndicator = (status: StatusState) => (
        <div className="relative group flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {status.checking && <Spinner className="h-4 w-4 text-sentinel-text-secondary" />}
            {!status.checking && status.ok !== null && (
                <div className={`h-2.5 w-2.5 rounded-full transition-colors ${status.ok ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
            )}
            {status.message && !status.checking && (
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 text-[10px] leading-tight text-center bg-sentinel-surface border border-sentinel-border rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sentinel-text-primary">
                    {status.message}
                </div>
            )}
        </div>
    );

    const renderApiKeyInput = (provider: ModelProvider) => {
        switch (provider) {
            case 'openai':
                return (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="openai_key" className="block text-sm font-medium text-sentinel-text-secondary">OpenAI API Key</label>
                            {renderStatusIndicator(openaiStatus)}
                        </div>
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
                                {keyVisibility.openAI ? <EyeSlashedIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                );
            case 'anthropic':
                return (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="anthropic_key" className="block text-sm font-medium text-sentinel-text-secondary">Anthropic API Key</label>
                            {renderStatusIndicator(anthropicStatus)}
                        </div>
                        <div className="relative">
                            <input
                                id="anthropic_key"
                                type={keyVisibility.anthropic ? 'text' : 'password'}
                                value={apiKeys.anthropic}
                                onChange={(e) => onApiKeysChange({ ...apiKeys, anthropic: e.target.value })}
                                className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary pr-10"
                                placeholder="sk-ant-..."
                            />
                            <button
                                type="button"
                                onClick={() => setKeyVisibility(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-sentinel-text-secondary hover:text-sentinel-text-primary"
                                aria-label="Toggle API key visibility"
                            >
                                {keyVisibility.anthropic ? <EyeSlashedIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                );
            case 'ollama':
                return (
                     <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <label htmlFor="ollama_url" className="block text-sm font-medium text-sentinel-text-secondary">Ollama Base URL</label>
                                <button onClick={() => setCorsModalVisible(true)} className="text-[10px] text-sentinel-primary hover:underline focus:outline-none">
                                    Help
                                </button>
                            </div>
                            {renderStatusIndicator(ollamaStatus)}
                        </div>
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
                                {keyVisibility.ollama ? <EyeSlashedIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                );
            default:
                 return <p className="text-xs text-sentinel-text-secondary italic">Gemini configured via API_KEY environment variable.</p>;
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
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="provider" className="block text-xs font-medium text-sentinel-text-secondary mb-1">Provider</label>
                        <select id="provider" value={llmConfig.provider} onChange={handleProviderChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                            <option value="gemini">Gemini</option>
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Claude</option>
                            <option value="ollama">Ollama</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-xs font-medium text-sentinel-text-secondary mb-1">Model</label>
                        <select id="model" value={llmConfig.model} onChange={handleModelChange} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary">
                            {MODEL_OPTIONS[llmConfig.provider].map(modelName => (
                                <option key={modelName} value={modelName}>{modelName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border border-sentinel-border rounded-lg p-3 space-y-3 bg-sentinel-bg/30 shadow-inner">
                    <h3 className="text-xs font-bold text-sentinel-text-primary uppercase tracking-tight">API Credentials</h3>
                    {renderApiKeyInput(llmConfig.provider)}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="temperature" className="block text-xs font-medium text-sentinel-text-secondary mb-1">Temp: {llmConfig.temperature}</label>
                        <input type="range" id="temperature" min="0" max="1" step="0.1" value={llmConfig.temperature} onChange={e => onLlmConfigChange({...llmConfig, temperature: parseFloat(e.target.value)})} className="w-full h-1.5 bg-sentinel-border rounded-lg appearance-none cursor-pointer accent-sentinel-primary" />
                    </div>
                    <div>
                        <label htmlFor="topP" className="block text-xs font-medium text-sentinel-text-secondary mb-1">Top-P: {llmConfig.topP}</label>
                        <input type="range" id="topP" min="0" max="1" step="0.05" value={llmConfig.topP} onChange={e => onLlmConfigChange({...llmConfig, topP: parseFloat(e.target.value)})} className="w-full h-1.5 bg-sentinel-border rounded-lg appearance-none cursor-pointer accent-sentinel-primary" />
                    </div>
                </div>

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
                        <div className="relative group flex items-start gap-2 text-[11px] leading-snug text-sentinel-text-secondary bg-sentinel-bg/40 p-2 rounded-md border border-sentinel-border/50">
                            <InfoIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-sentinel-primary" />
                            <span>{currentAttack.description}</span>
                        </div>
                        {currentAttack.goal && (
                             <div className="relative group flex items-start gap-2 text-[11px] leading-snug text-sentinel-text-secondary bg-sentinel-bg/40 p-2 rounded-md border border-sentinel-border/50">
                                <TargetIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-sentinel-accent" />
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
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-center bg-sentinel-surface border border-sentinel-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                         Enable to have an AI generate the next attack step for you. Requires a template with a defined goal.
                                     </div>
                                 </div>
                             </div>
                            <button
                                type="button"
                                id="adv-mode-toggle"
                                onClick={() => onAdversarialModeChange(!isAdversarialMode)}
                                disabled={!currentAttack?.goal}
                                className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sentinel-surface focus:ring-sentinel-primary disabled:opacity-30 disabled:cursor-not-allowed ${isAdversarialMode ? 'bg-sentinel-primary' : 'bg-sentinel-border'}`}
                            >
                                <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${isAdversarialMode ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                )}

                {currentAttack && currentAttack.suggestedSystemPrompts.length > 0 && (
                    <div>
                        <label htmlFor="system_prompt_template" className="block text-xs font-medium text-sentinel-text-secondary mb-1">Suggested Behavior</label>
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
                    <label htmlFor="system_prompt" className="block text-xs font-medium text-sentinel-text-secondary mb-1">System Prompt</label>
                    <textarea
                        id="system_prompt"
                        rows={4}
                        value={systemPrompt}
                        onChange={(e) => onSystemPromptChange(e.target.value)}
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-xs font-mono focus:ring-sentinel-primary focus:border-sentinel-primary custom-scrollbar"
                        placeholder="Set the AI's behavior and context..."
                    />
                </div>

                <div className="border-t border-sentinel-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <WrenchIcon className="h-4 w-4 text-sentinel-primary" />
                            <h3 className="text-sm font-medium text-sentinel-text-primary">Simulated Agent Tools</h3>
                            <div className="relative group">
                                <InfoIcon className="h-3 w-3 text-sentinel-text-secondary cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-[10px] leading-tight text-center bg-sentinel-surface border border-sentinel-border rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sentinel-text-primary">
                                    Tools are mapped to **MITRE ATLAS** techniques and **OWASP LLM07/LLM08** vulnerability patterns for AI Agents.
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={onGenerateTools}
                                disabled={isGeneratingTools}
                                className={`text-[10px] bg-sentinel-accent/20 text-sentinel-accent px-2 py-0.5 rounded border border-sentinel-accent/30 hover:bg-sentinel-accent/40 transition-colors flex items-center gap-1 ${isGeneratingTools ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Use AI to generate tools aligned with MITRE ATLAS and OWASP security standards"
                            >
                                {isGeneratingTools ? (
                                    <>
                                        <Spinner className="h-3 w-3 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BrainCircuitIcon className="h-3 w-3" />
                                        AI Generate
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => onToolsChange([...session.tools, { id: uuidv4(), name: 'new_tool', description: 'Describe tool...', parameters: '{}' }])}
                                className="text-[10px] bg-sentinel-primary/20 text-sentinel-primary px-2 py-0.5 rounded border border-sentinel-primary/30 hover:bg-sentinel-primary/30 transition-colors"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {session.tools.length === 0 && (
                            <p className="text-[10px] text-sentinel-text-secondary italic text-center py-2">No tools defined for this agent session.</p>
                        )}
                        {session.tools.map((tool) => (
                            <div key={tool.id} className="bg-sentinel-bg/50 border border-sentinel-border rounded p-2 text-[10px] space-y-1 group relative">
                                <button 
                                    onClick={() => onToolsChange(session.tools.filter(t => t.id !== tool.id))}
                                    className="absolute top-2 right-2 text-sentinel-text-secondary hover:text-sentinel-accent opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                                <input 
                                    className="w-full bg-transparent border-b border-transparent focus:border-sentinel-primary outline-none font-bold text-sentinel-text-primary"
                                    value={tool.name}
                                    onChange={(e) => onToolsChange(session.tools.map(t => t.id === tool.id ? { ...t, name: e.target.value } : t))}
                                    placeholder="Tool Name"
                                />
                                <input 
                                    className="w-full bg-transparent border-b border-transparent focus:border-sentinel-primary outline-none text-sentinel-text-secondary"
                                    value={tool.description}
                                    onChange={(e) => onToolsChange(session.tools.map(t => t.id === tool.id ? { ...t, description: e.target.value } : t))}
                                    placeholder="Description"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-sentinel-primary/60 uppercase">Params:</span>
                                    <input 
                                        className="flex-1 bg-transparent border-b border-transparent focus:border-sentinel-primary outline-none font-mono"
                                        value={tool.parameters}
                                        onChange={(e) => onToolsChange(session.tools.map(t => t.id === tool.id ? { ...t, parameters: e.target.value } : t))}
                                        placeholder='{"param": "type"}'
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-auto pt-4 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <button
                        onClick={onSaveSession}
                        disabled={session.messages.length === 0}
                        className="w-full px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-border/50 border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                    <button 
                        onClick={onClearSession} 
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-sentinel-accent/80 border border-transparent rounded-md hover:bg-sentinel-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
                    >
                        Clear
                    </button>
                 </div>
                 <button 
                    onClick={onShowDebugger}
                    disabled={!chatInput.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-border/50 border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                 >
                    <BugIcon className="h-4 w-4 mr-2" />
                    Analyze Payload
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
