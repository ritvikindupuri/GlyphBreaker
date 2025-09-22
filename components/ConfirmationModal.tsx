import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onCancel}>
            <div className="bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-sentinel-border">
                    <h2 className="text-xl font-bold text-sentinel-text-primary">{title}</h2>
                </div>
                <div className="p-6 text-sentinel-text-secondary">
                    {children}
                </div>
                <div className="flex justify-end gap-3 p-4 bg-sentinel-bg/30 border-t border-sentinel-border">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-sentinel-text-primary bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-sentinel-accent/80 rounded-md hover:bg-sentinel-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;