export type ModelProvider = 'gemini' | 'openai' | 'ollama';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface LlmConfig {
    provider: ModelProvider;
    model: string;
    temperature: number;
    topP: number;
    topK: number;
}

export interface Session {
    id: string;
    messages: Message[];
    systemPrompt: string;
    llmConfig: LlmConfig;
}

export interface ApiKeys {
    openAI: string;
    ollama: string; // Ollama base URL, e.g., http://localhost:11434
}

export interface SuggestedSystemPrompt {
    name: string;
    prompt: string;
}

export interface AttackTemplate {
    name: string;
    description: string;
    suggestedSystemPrompts: SuggestedSystemPrompt[];
    userPrompt: string;
}
