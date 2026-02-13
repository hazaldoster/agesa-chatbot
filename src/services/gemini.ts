import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { Message, GeminiConfig } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatHistory: Content[] = [];
  private systemInstruction: string;

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.systemInstruction = config.systemInstruction || 
      `Sen Agesa Finansal Terapi asistanısın. Kullanıcılara finansal konularda yardımcı oluyorsun. 
      Türkçe konuşuyorsun ve empati kurarak, destekleyici bir şekilde yanıt veriyorsun.
      Finansal kararlar, yatırımlar, bütçe yönetimi ve finansal stres konularında rehberlik sağlıyorsun.`;
    
    this.model = this.genAI.getGenerativeModel({
      model: config.modelName || 'gemini-2.0-flash',
      systemInstruction: this.systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  async sendMessage(content: string): Promise<Message | null> {
    try {
      // Add user message to history
      const userContent: Content = {
        role: 'user',
        parts: [{ text: content }] as Part[],
      };
      this.chatHistory.push(userContent);

      // Start chat with history
      const chat = this.model.startChat({
        history: this.chatHistory.slice(0, -1), // Exclude the last message as it will be sent
      });

      // Send message and get response
      const result = await chat.sendMessage(content);
      const response = await result.response;
      const responseText = response.text();

      // Add assistant response to history
      const assistantContent: Content = {
        role: 'model',
        parts: [{ text: responseText }] as Part[],
      };
      this.chatHistory.push(assistantContent);

      return {
        id: `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw error;
    }
  }

  clearHistory(): void {
    this.chatHistory = [];
  }
}

export default GeminiService;
