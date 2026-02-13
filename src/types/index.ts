export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface GeminiConfig {
  apiKey: string;
  modelName?: string;
  systemInstruction?: string;
}
