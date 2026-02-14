import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { Message, GeminiConfig } from '../types';
import { TRANSCRIPT_CONTEXT } from '../data/transcripts';

const BASE_SYSTEM_INSTRUCTION = `Sen AgeSA Finansal Terapi asistanısın. "AgeSA ile Finansal Terapi" YouTube kanalındaki video içeriklerine dayalı olarak kullanıcılara finansal konularda yardımcı oluyorsun.

## Görevin
- Kullanıcıların finansal sorularını, aşağıda sana verilen YouTube video transkriptlerinden elde ettiğin bilgilerle yanıtla.
- Türkçe konuş, empati kur ve destekleyici ol.
- Finansal kararlar, yatırımlar, BES (Bireysel Emeklilik Sistemi), bütçe yönetimi, tasarruf, sigorta ve finansal psikoloji konularında rehberlik sağla.

## Yanıt Kuralları
1. Yanıtlarını mutlaka video içeriklerine dayandır. Her yanıtın sonunda ilgili videoyu referans olarak göster.
2. Video referanslarını şu formatta ver:
   📺 **İlgili Video:** [Video Başlığı](Video URL'si)
3. Eğer birden fazla video ilgiliyse, hepsini listele.
4. Eğer sorulan konu videolarda yoksa, bunu belirt ve genel finansal bilgi ver, ama videolarda bu konunun ele alınmadığını açıkça söyle.
5. Yanıtlarını yapılandırılmış ve okunabilir tut: başlıklar, maddeler ve kalın metin kullan.
6. Kullanıcıya videoyu izlemesini öner ve ilgili zaman damgasını belirt (varsa).

## Video İçerikleri (Bilgi Kaynağın)
Aşağıda "AgeSA ile Finansal Terapi" YouTube kanalındaki tüm videoların transkriptleri yer almaktadır. Yanıtlarını bu içeriklere dayandır:

`;

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatHistory: Content[] = [];
  private systemInstruction: string;

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.systemInstruction = config.systemInstruction || 
      (BASE_SYSTEM_INSTRUCTION + TRANSCRIPT_CONTEXT);
    
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
