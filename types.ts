
export type ModelProvider = 'gemini' | 'openai' | 'ollama';

export interface ApiKeys {
    openAI: string;
    ollama: string;
}

export interface LlmConfig {
    provider: ModelProvider;
    model: string;
    temperature: number;
    topP: number;
    topK: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface Session {
    id: string;
    name: string;
    messages: Message[];
    systemPrompt: string;
    llmConfig: LlmConfig;
}

export interface AttackTemplate {
    name: string;
    description: string;
    userPrompt: string;
    suggestedSystemPrompts: { name: string; prompt: string }[];
}
