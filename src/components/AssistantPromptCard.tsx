import React from 'react';

interface AssistantPromptCardProps {
  prompt: {
    type: 'quickReplies' | 'slider' | 'dropdown';
    options?: string[];
    question: string;
    min?: number;
    max?: number;
    step?: number;
  };
  onSelect: (value: string | number) => void;
}

const AssistantPromptCard: React.FC<AssistantPromptCardProps> = ({ prompt, onSelect }) => {
  if (!prompt) return null;

  return (
    <div style={{ background: '#fffbe6', border: '1px solid #ffe082', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ marginBottom: 12, fontWeight: 500 }}>{prompt.question}</div>
      {prompt.type === 'quickReplies' && prompt.options && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {prompt.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              style={{ padding: '6px 16px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {prompt.type === 'slider' && (
        <input
          type="range"
          min={prompt.min || 0}
          max={prompt.max || 100}
          step={prompt.step || 1}
          onChange={(e) => onSelect(Number(e.target.value))}
        />
      )}
      {prompt.type === 'dropdown' && prompt.options && (
        <select onChange={(e) => onSelect(e.target.value)}>
          <option value="">Select...</option>
          {prompt.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default AssistantPromptCard;
