import React, { useState, useEffect } from 'react';
import type { AttackTemplate } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface CustomTemplateManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: AttackTemplate[];
    onSave: (template: AttackTemplate) => void;
    onDelete: (templateId: string) => void;
}

const BLANK_TEMPLATE: Omit<AttackTemplate, 'id'> = {
    name: '',
    description: '',
    userPrompt: '',
    goal: '',
    suggestedSystemPrompts: [{ name: 'Default', prompt: 'You are a helpful assistant.' }],
};

const CustomTemplateManagerModal: React.FC<CustomTemplateManagerModalProps> = ({ isOpen, onClose, templates, onSave, onDelete }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [currentTemplate, setCurrentTemplate] = useState<AttackTemplate | Omit<AttackTemplate, 'id'> | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<AttackTemplate | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setView('list');
            setCurrentTemplate(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleEdit = (template: AttackTemplate) => {
        setCurrentTemplate({ ...template });
        setView('form');
    };

    const handleCreateNew = () => {
        setCurrentTemplate(BLANK_TEMPLATE);
        setView('form');
    };

    const handleBackToList = () => {
        setCurrentTemplate(null);
        setView('list');
    };

    const handleSave = () => {
        if (currentTemplate && currentTemplate.name.trim()) {
            onSave(currentTemplate as AttackTemplate);
            handleBackToList();
        }
    };
    
    const handleDeleteRequest = (template: AttackTemplate) => {
        setTemplateToDelete(template);
    };

    const confirmDelete = () => {
        if (templateToDelete && templateToDelete.id) {
            onDelete(templateToDelete.id);
        }
        setTemplateToDelete(null);
    };

    const handleFormChange = (field: keyof AttackTemplate, value: any) => {
        if (currentTemplate) {
            setCurrentTemplate(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleSystemPromptChange = (index: number, field: 'name' | 'prompt', value: string) => {
        if (currentTemplate) {
            const newPrompts = [...currentTemplate.suggestedSystemPrompts];
            newPrompts[index] = { ...newPrompts[index], [field]: value };
            handleFormChange('suggestedSystemPrompts', newPrompts);
        }
    };

    const addSystemPrompt = () => {
        if (currentTemplate) {
            const newPrompts = [...currentTemplate.suggestedSystemPrompts, { name: '', prompt: '' }];
            handleFormChange('suggestedSystemPrompts', newPrompts);
        }
    };

    const removeSystemPrompt = (index: number) => {
        if (currentTemplate && currentTemplate.suggestedSystemPrompts.length > 1) {
            const newPrompts = currentTemplate.suggestedSystemPrompts.filter((_, i) => i !== index);
            handleFormChange('suggestedSystemPrompts', newPrompts);
        }
    };
    

    const renderListView = () => (
        <>
            <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                {templates.length === 0 ? (
                    <p className="text-sentinel-text-secondary text-center">No custom templates created yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {templates.map(template => (
                            <li key={template.id} className="bg-sentinel-bg p-3 rounded-md border border-sentinel-border flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sentinel-text-primary">{template.name}</p>
                                    <p className="text-xs text-sentinel-text-secondary truncate max-w-xs">{template.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(template)} className="px-3 py-1 text-xs font-medium bg-sentinel-border/70 hover:bg-sentinel-border rounded-md transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteRequest(template)} className="p-1.5 text-sentinel-text-secondary hover:text-sentinel-accent transition-colors">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="p-4 border-t border-sentinel-border bg-sentinel-surface/50 flex justify-end">
                <button onClick={handleCreateNew} className="px-4 py-2 text-sm font-medium text-white bg-sentinel-primary rounded-md hover:bg-blue-500 transition-colors">
                    Create New Template
                </button>
            </div>
        </>
    );

    const renderFormView = () => (
        <>
            <div className="p-6 flex-grow overflow-y-auto custom-scrollbar space-y-4 text-sm">
                <div>
                    <label htmlFor="tmpl-name" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Template Name</label>
                    <input id="tmpl-name" type="text" value={currentTemplate?.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 focus:ring-sentinel-primary focus:border-sentinel-primary"/>
                </div>
                 <div>
                    <label htmlFor="tmpl-desc" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Description</label>
                    <textarea id="tmpl-desc" rows={2} value={currentTemplate?.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 focus:ring-sentinel-primary focus:border-sentinel-primary"/>
                </div>
                 <div>
                    <label htmlFor="tmpl-user" className="block text-sm font-medium text-sentinel-text-secondary mb-1">User Prompt</label>
                    <textarea id="tmpl-user" rows={5} value={currentTemplate?.userPrompt || ''} onChange={(e) => handleFormChange('userPrompt', e.target.value)} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 focus:ring-sentinel-primary focus:border-sentinel-primary"/>
                </div>
                <div>
                    <label htmlFor="tmpl-goal" className="block text-sm font-medium text-sentinel-text-secondary mb-1">Adversarial Goal (Optional)</label>
                    <textarea 
                        id="tmpl-goal" 
                        rows={3} 
                        value={currentTemplate?.goal || ''} 
                        onChange={(e) => handleFormChange('goal', e.target.value)} 
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 focus:ring-sentinel-primary focus:border-sentinel-primary"
                        placeholder="e.g., Make the model reveal its initial instructions..."
                    />
                    <p className="text-xs text-sentinel-text-secondary mt-1">
                        Defining a goal enables the AI-powered "Adversarial Mode" for this template.
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-sentinel-text-secondary mb-2">Suggested System Prompts</h4>
                    <div className="space-y-3">
                        {currentTemplate?.suggestedSystemPrompts.map((p, i) => (
                            <div key={i} className="bg-sentinel-bg/50 border border-sentinel-border/50 rounded-md p-3">
                                <div className="flex justify-between items-center mb-2">
                                     <label htmlFor={`sys-name-${i}`} className="block text-xs font-medium text-sentinel-text-secondary">Prompt Name</label>
                                     <button onClick={() => removeSystemPrompt(i)} disabled={(currentTemplate.suggestedSystemPrompts.length || 0) <= 1} className="text-sentinel-text-secondary hover:text-sentinel-accent disabled:opacity-50 disabled:cursor-not-allowed">
                                        <TrashIcon className="h-4 w-4"/>
                                     </button>
                                </div>
                                <input id={`sys-name-${i}`} type="text" value={p.name} onChange={(e) => handleSystemPromptChange(i, 'name', e.target.value)} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 mb-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"/>
                                <label htmlFor={`sys-prompt-${i}`} className="block text-xs font-medium text-sentinel-text-secondary mb-1">Prompt Content</label>
                                <textarea id={`sys-prompt-${i}`} rows={3} value={p.prompt} onChange={(e) => handleSystemPromptChange(i, 'prompt', e.target.value)} className="w-full bg-sentinel-bg border border-sentinel-border rounded-md px-3 py-2 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"/>
                            </div>
                        ))}
                    </div>
                     <button onClick={addSystemPrompt} className="mt-3 w-full px-3 py-2 text-xs text-center font-medium bg-sentinel-border/50 hover:bg-sentinel-border rounded-md transition-colors">Add System Prompt</button>
                </div>
            </div>
            <div className="p-4 border-t border-sentinel-border bg-sentinel-surface/50 flex justify-between">
                 <button onClick={handleBackToList} className="px-4 py-2 text-sm font-medium bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors">
                    Back to List
                </button>
                <button onClick={handleSave} disabled={!currentTemplate?.name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-sentinel-primary rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50">
                    Save Template
                </button>
            </div>
        </>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-sentinel-border">
                        <h2 className="text-xl font-bold text-sentinel-text-primary">
                            {view === 'list' ? 'Custom Attack Templates' : (currentTemplate && 'id' in currentTemplate ? 'Edit Template' : 'Create New Template')}
                        </h2>
                        <button onClick={onClose} className="text-sentinel-text-secondary text-2xl leading-none hover:text-sentinel-text-primary">&times;</button>
                    </div>
                    {view === 'list' ? renderListView() : renderFormView()}
                </div>
            </div>
            {templateToDelete && (
                 <ConfirmationModal
                    isOpen={!!templateToDelete}
                    onConfirm={confirmDelete}
                    onCancel={() => setTemplateToDelete(null)}
                    title="Delete Template?"
                >
                   <p>Are you sure you want to permanently delete the template "{templateToDelete.name}"?</p>
                </ConfirmationModal>
            )}
        </>
    );
};

export default CustomTemplateManagerModal;