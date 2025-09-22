import React from 'react';
import type { Session } from '../types';

interface SessionHistoryModalProps {
    sessions: Session[];
    onClose: () => void;
    onRestore: (sessionId: string) => void;
}

const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({ sessions, onClose, onRestore }) => {
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
                            {sessions.map(session => (
                                <li key={session.id} className="bg-sentinel-bg p-3 rounded-md border border-sentinel-border flex justify-between items-center">
                                    <div>
                                        <p className="text-sentinel-text-primary font-medium">Session from {new Date().toLocaleString()}</p>
                                        <p className="text-xs text-sentinel-text-secondary">{session.messages.length} messages</p>
                                    </div>
                                    <button
                                        onClick={() => onRestore(session.id)}
                                        className="px-3 py-1 text-xs font-medium text-white bg-sentinel-primary rounded-md hover:bg-blue-500 transition-colors"
                                    >
                                        Restore
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionHistoryModal;