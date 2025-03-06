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
  margin: 0 auto; /* Center the container */
  background-color: #fff;
  overflow: hidden;
  border-radius: 20px; /* Add corner radius */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* Enhanced drop shadow */
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 1080px;
  height: 1080px;
  margin: 0 auto; /* Center the container */
  background-color: #f5f7fb;
  background-image: radial-gradient(#e0e6f5 1px, transparent 1px), radial-gradient(#e0e6f5 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 20px; /* Add corner radius */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Add drop shadow */
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
`;

const WelcomeLogo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  overflow: hidden;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.6;
`;

function App() {
  const [showChat, setShowChat] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  const assistantId = process.env.REACT_APP_ASSISTANT_ID || '';

  if (!apiKey || !assistantId) {
    console.error('Missing OpenAI API credentials. Please check your .env file.');
  }

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
          assistantId={assistantId} 
          onBack={handleBackToWelcome}
          boxed={true}
          initialMessages={initialMessages}
          initialQuestion={userQuestion}
        />
      </AppContainer>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {}
      <img 
        src="/AgeSA-Icon-192x192.png" 
        alt="AgeSA Logo" 
        style={{
          width: '120px',  
          height: '120px', 
          marginBottom: '50px'
        }}
      />
      
      {}
      <WelcomeCard style={{ width: '800px' }}>
        <WelcomeTitle style={{ fontSize: '40px' }}>Agesa Finansal Terapi</WelcomeTitle>
        
        <div style={{ 
          marginTop: '26px', 
          position: 'relative',
          width: '100%',
          gap: '15px'
        }}>
          <div style={{ 
            position: 'relative',
            width: '100%'
          }}>
            <textarea
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
              style={{
                padding: '15px 20px',
                paddingRight: '60px', 
                borderRadius: '25px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '15px',
                minHeight: '80px',
                height: '80px',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <button
              onClick={() => handleStartChat(userQuestion)}
              disabled={!userQuestion.trim()}
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #ccc',
                backgroundColor: 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                right: '15px',
                top: '20px', 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L20 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 6L20 12L14 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </WelcomeCard>
    </div>
  );
}

export default App;
