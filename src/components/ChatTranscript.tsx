import React from 'react';

type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

interface ChatTranscriptProps {
  messages: ChatMessage[];
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({ messages }) => {
  return (
    <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, minHeight: 200, marginBottom: 16 }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
              color: msg.sender === 'user' ? '#fff' : '#222',
              borderRadius: 16,
              padding: '8px 16px',
              maxWidth: '70%',
              fontSize: 16,
            }}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatTranscript;
