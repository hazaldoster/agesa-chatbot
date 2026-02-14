import React, { useState } from 'react';
import styled from 'styled-components';
import Chat from './components/Chat';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './types';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 900px;
  height: 900px;
  padding: 0;
  margin: 0 auto;
  background-color: #fff;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  @media (max-width: 1024px) {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    box-shadow: none;
  }
`;

const WelcomeCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 700px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 24px 16px;
    width: 95%;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const WelcomeContainer = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 40px 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 30px 16px;
    justify-content: center;
  }
`;

const WelcomeLogo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
  }
`;

const InputSection = styled.div`
  margin-top: 26px;
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const TextareaWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const WelcomeTextarea = styled.textarea`
  padding: 15px 20px;
  padding-right: 60px;
  border-radius: 25px;
  border: 1px solid #ccc;
  width: 100%;
  font-size: 15px;
  min-height: 80px;
  height: 80px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 16px;
    padding-right: 55px;
    min-height: 70px;
    height: 70px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    min-height: 100px;
    height: 100px;
  }

  &:focus {
    outline: none;
    border-color: #0084ff;
    box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.2);
  }
`;

const WelcomeSendButton = styled.button`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  right: 15px;
  top: 20px;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    right: 12px;
    top: 17px;
  }

  @media (max-width: 480px) {
    top: 32px;
  }
`;

function App() {
  const [showChat, setShowChat] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';

  const handleStartChat = async (question: string) => {
    if (!question.trim()) return;
    
    try {
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };
      
      setInitialMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: ' Merhaba, Ben Finansal Terapistiniz. Aklınızda bir konu var mı?',
          timestamp: new Date(),
        },
        userMessage
      ]);
      
      setUserQuestion(question);
      
      setShowChat(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleBackToWelcome = () => {
    setShowChat(false);
    setUserQuestion('');
    setInitialMessages([]);
  };

  if (showChat) {
    return (
      <AppContainer>
        <Chat 
          apiKey={apiKey} 
          onBack={handleBackToWelcome}
          boxed={true}
          initialMessages={initialMessages}
          initialQuestion={userQuestion}
        />
      </AppContainer>
    );
  }

  return (
    <WelcomeContainer>
      <WelcomeLogo 
        src="/AgeSA-Icon-192x192.png" 
        alt="AgeSA Logo" 
      />
      
      <WelcomeCard>
        <WelcomeTitle>Agesa Finansal Terapi</WelcomeTitle>
        
        <InputSection>
          <TextareaWrapper>
            <WelcomeTextarea
              placeholder="Benimle finansal kararlarınızı konuşabilir, hislerinizi paylaşabilirsiniz. Ne hakkında konuşalım?"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (userQuestion.trim()) {
                    handleStartChat(userQuestion);
                  }
                }
              }}
            />
            <WelcomeSendButton
              onClick={() => handleStartChat(userQuestion)}
              disabled={!userQuestion.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L20 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 6L20 12L14 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </WelcomeSendButton>
          </TextareaWrapper>
        </InputSection>
      </WelcomeCard>
    </WelcomeContainer>
  );
}

export default App;
