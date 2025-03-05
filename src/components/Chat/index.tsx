import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../types';
import OpenAIService from '../../services/openai';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  margin: 0;
  background-color: #fff;
  background-image: url('/unnamed-2.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #333;
  color: white;
  border-bottom: none;
`;

const ChatHeaderAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ChatHeaderTitle = styled.h1`
  font-size: 1.3rem;
  margin: 0;
  font-weight: 500;
`;

const ChatHeaderStatus = styled.div`
  margin-left: auto;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #4caf50;
    margin-right: 6px;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(245, 247, 251, 0.7);
  height: calc(100vh - 130px);
  border: none;
`;

interface MessageGroupProps {
  isUser: boolean;
}

const MessageGroup = styled.div<MessageGroupProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 80%;
  align-self: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
`;

interface MessageBubbleProps {
  isUser: boolean;
}

const MessageBubble = styled.div<MessageBubbleProps>`
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => (props.isUser ? '#0084ff' : 'rgba(255, 255, 255, 0.9)')};
  color: ${props => (props.isUser ? 'white' : '#333')};
  margin-bottom: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.5;
  
  &:first-child {
    border-top-left-radius: ${props => (props.isUser ? '18px' : '4px')};
    border-top-right-radius: ${props => (props.isUser ? '4px' : '18px')};
  }
  
  &:last-child {
    border-bottom-left-radius: ${props => (props.isUser ? '18px' : '4px')};
    border-bottom-right-radius: ${props => (props.isUser ? '4px' : '18px')};
  }
`;

interface MessageTimeProps {
  isUser: boolean;
}

const MessageTime = styled.div<MessageTimeProps>`
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
  align-self: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: none;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  position: relative;
  border: none;
  border-radius: 24px;
  background-color: rgba(245, 245, 245, 0.9);
  padding: 0 10px;
  
  &:focus-within {
    border: none;
    box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.2);
  }
`;

const InputPrefixIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #666;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px 5px;
  border: none;
  background-color: transparent;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  margin-left: 10px;
  padding: 10px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0073e6;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px 0;
  align-self: flex-start;
  
  &:after {
    content: ' ';
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #0084ff;
    border-color: #0084ff transparent #0084ff transparent;
    animation: spin 1.2s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorBanner = styled.div`
  padding: 12px 16px;
  margin-bottom: 15px;
  background-color: #f8d7da;
  border: none;
  border-radius: 4px;
  color: #721c24;
  font-size: 1rem;
`;

const BotName = styled.span`
  background-color: #5b48ee;
  color: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  white-space: nowrap;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  margin-right: 10px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

interface ChatProps {
  apiKey: string;
  assistantId: string;
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({ apiKey, assistantId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API credentials are provided
    if (!apiKey || !assistantId) {
      setConnectionError('API kimlik bilgileri eksik. Lütfen .env dosyanızı kontrol edin.');
      return;
    }

    try {
      // Initialize OpenAI service
      const service = new OpenAIService({ apiKey, assistantId });
      setOpenAIService(service);
      
      // Add welcome message
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Merhaba! Size finansal konularda nasıl yardımcı olabilirim?',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error initializing OpenAI service:', error);
      setConnectionError('OpenAI servisini başlatırken hata oluştu. Lütfen kimlik bilgilerinizi kontrol edin.');
    }
  }, [apiKey, assistantId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !openAIService) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to OpenAI
      const response = await openAIService.sendMessage(input);
      
      if (response) {
        // Add assistant response
        setMessages(prev => [...prev, response as Message]);
      } else {
        throw new Error('No response received from assistant');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Üzgünüm, isteğinizi işlerken bir hata oluştu. Lütfen tekrar deneyin.',
          timestamp: new Date(),
        } as Message,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Group messages by sender
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message) => {
    const lastGroup = Object.keys(groupedMessages).pop();
    if (lastGroup && messages[parseInt(lastGroup)].role === message.role) {
      groupedMessages[lastGroup].push(message);
    } else {
      groupedMessages[String(Object.keys(groupedMessages).length)] = [message];
    }
  });

  return (
    <ChatContainer>
      <ChatHeader>
        {onBack && (
          <BackButton onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackButton>
        )}
        <ChatHeaderAvatar>
          <AvatarImage src="/AgeSA-Icon-192x192.png" alt="Agesa Logo" />
        </ChatHeaderAvatar>
        <ChatHeaderTitle>Finansal Asistan</ChatHeaderTitle>
        <BotName>Agesa Finansal Terapi</BotName>
        <ChatHeaderStatus>Çevrimiçi</ChatHeaderStatus>
      </ChatHeader>
      
      <MessagesContainer>
        {connectionError && (
          <ErrorBanner>
            <strong>Hata:</strong> {connectionError}
          </ErrorBanner>
        )}
        
        {Object.entries(groupedMessages).map(([groupId, groupMessages]) => (
          <MessageGroup 
            key={groupId} 
            isUser={groupMessages[0].role === 'user'}
          >
            {groupMessages.map((message) => (
              <MessageBubble 
                key={message.id} 
                isUser={message.role === 'user'}
              >
                {message.content}
              </MessageBubble>
            ))}
            <MessageTime isUser={groupMessages[0].role === 'user'}>
              {formatTime(groupMessages[groupMessages.length - 1].timestamp)}
            </MessageTime>
          </MessageGroup>
        ))}
        
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <InputWrapper>
          <InputPrefixIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </InputPrefixIcon>
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Finansal terapi hakkında herhangi bir soru sor"
            disabled={isLoading || !!connectionError}
          />
        </InputWrapper>
        <SendButton 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim() || !!connectionError}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 