import React, { useState } from 'react';

interface ChatComposerProps {
  onSend: (text: string) => void;
}

const ChatComposer: React.FC<ChatComposerProps> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
      />
      <button
        onClick={handleSend}
        style={{ padding: '8px 16px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold' }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatComposer;
