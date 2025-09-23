import React, { useState } from 'react';
import type { Session } from '../types';

interface SessionHistoryModalProps {
    sessions: Session[];
    onClose: () => void;
    onRestore: (sessionId: string) => void;
    onRename: (sessionId: string, newName: string) => void;
}

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);


const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({ sessions, onClose, onRestore, onRename }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const handleStartEditing = (session: Session) => {
        setEditingId(session.id);
        setNewName(session.name || '');
    };

    const handleSaveRename = () => {
        if (editingId && newName.trim()) {
            onRename(editingId, newName);
        }
        setEditingId(null);
        setNewName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveRename();
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setNewName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-sentinel-border">
                    <h2 className="text-xl font-bold text-sentinel-text-primary">Cleared Sessions</h2>
                    <button onClick={onClose} className="text-sentinel-text-secondary hover:text-sentinel-text-primary">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <p className="text-sentinel-text-secondary text-center">No cleared sessions yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map(session => {
                                const isEditing = editingId === session.id;
                                return (
                                <li key={session.id} className="bg-sentinel-bg p-3 rounded-md border border-sentinel-border flex justify-between items-center">
                                    <div className="flex-grow">
                                        {isEditing ? (
                                             <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onBlur={handleSaveRename}
                                                onKeyDown={handleKeyDown}
                                                className="w-full bg-sentinel-surface border border-sentinel-primary rounded-md px-2 py-1 text-sm focus:ring-sentinel-primary focus:border-sentinel-primary"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-sentinel-text-primary font-medium">{session.name || `Session ${session.id.substring(0,8)}`}</p>
                                        )}
                                        <p className="text-xs text-sentinel-text-secondary">{session.messages.length} messages</p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-4">
                                        {!isEditing && (
                                            <button onClick={() => handleStartEditing(session)} className="p-1 text-sentinel-text-secondary hover:text-sentinel-primary transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onRestore(session.id)}
                                            className="px-3 py-1 text-xs font-medium text-white bg-sentinel-primary rounded-md hover:bg-blue-500 transition-colors"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionHistoryModal;