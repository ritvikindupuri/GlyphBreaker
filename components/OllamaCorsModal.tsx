import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-sentinel-bg p-3 rounded-md border border-sentinel-border/50 text-sm text-sentinel-text-primary overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const OllamaCorsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-sentinel-border">
                    <h2 className="text-xl font-bold text-sentinel-text-primary">Ollama Connection Help</h2>
                    <button onClick={onClose} className="text-sentinel-text-secondary text-2xl leading-none hover:text-sentinel-text-primary">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto text-sentinel-text-secondary space-y-4 custom-scrollbar">
                    <p>
                        If the status indicator is red, it's usually because your browser cannot connect to the Ollama server. This is a security feature called CORS (Cross-Origin Resource Sharing).
                    </p>
                    <p>
                        To fix this, you need to configure Ollama to allow connections from this web application by setting the <code className="bg-sentinel-bg px-1 rounded">OLLAMA_ORIGINS</code> environment variable.
                    </p>

                    <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">macOS</h3>
                        <p className="mb-2">Open the Terminal app and run these commands:</p>
                        <CodeBlock>
                            {`# Allow all web pages to connect (easiest)\nlaunchctl setenv OLLAMA_ORIGINS "*"\n\n# Restart Ollama to apply the change\nlaunchctl unload ~/Library/LaunchAgents/com.ollama.ollama.plist\nlaunchctl load ~/Library/LaunchAgents/com.ollama.ollama.plist`}
                        </CodeBlock>
                    </div>

                     <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">Windows</h3>
                        <p className="mb-2">You need to set a system environment variable:</p>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                           <li>Press the Windows key, type <code className="bg-sentinel-bg px-1 rounded">env</code>, and select "Edit the system environment variables".</li>
                           <li>In the System Properties window, click "Environment Variables...".</li>
                           <li>Under "System variables", click "New...".</li>
                           <li>For <span className="font-bold">Variable name</span>, enter: <code className="bg-sentinel-bg px-1 rounded">OLLAMA_ORIGINS</code></li>
                           <li>For <span className="font-bold">Variable value</span>, enter: <code className="bg-sentinel-bg px-1 rounded">*</code></li>
                           <li>Click OK on all windows to save.</li>
                           <li>Restart your computer or sign out and sign back in for the change to take effect.</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sentinel-text-primary mb-2">Linux</h3>
                        <p className="mb-2">Add the variable to your systemd configuration:</p>
                         <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li>Edit the systemd service file with: <code className="bg-sentinel-bg px-1 rounded">sudo systemctl edit ollama.service</code></li>
                            <li>This will open an editor. Add the following lines:
                                <CodeBlock>
{`[Service]
Environment="OLLAMA_ORIGINS=*"`}
                                </CodeBlock>
                            </li>
                             <li>Save the file and exit the editor.</li>
                             <li>Reload systemd and restart Ollama:
                                <CodeBlock>
{`sudo systemctl daemon-reload
sudo systemctl restart ollama`}
                                </CodeBlock>
                             </li>
                        </ol>
                    </div>
                     <p className="pt-4 border-t border-sentinel-border">
                        After applying these changes, the status indicator next to the URL input should turn green. For more details, refer to the <a href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-expose-ollama-on-my-network" target="_blank" rel="noopener noreferrer" className="text-sentinel-primary hover:underline">official Ollama FAQ</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OllamaCorsModal;