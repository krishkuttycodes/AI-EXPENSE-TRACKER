import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystemNotice = message.isUnconfiguredNotice;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '0.625rem',
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isUser ? 'var(--primary-600)' : isSystemNotice ? 'var(--warning-amber)' : '#8b5cf6',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isUser ? <User size={14} /> : isSystemNotice ? <AlertCircle size={14} /> : <Bot size={14} />}
      </div>

      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
        <div>{message.message}</div>
        {message.setupInstructions && (
          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Setup Steps:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              {message.setupInstructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
