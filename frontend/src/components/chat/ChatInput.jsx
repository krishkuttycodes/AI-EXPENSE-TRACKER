import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export const ChatInput = ({ onSend, loading = false, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ai-chat-input-box">
      <input
        type="text"
        placeholder="Ask a question about your expenses..."
        className="form-control"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || disabled}
        style={{ padding: '0.625rem 0.875rem' }}
      />
      <button
        type="submit"
        className="btn btn-primary btn-icon"
        disabled={!text.trim() || loading || disabled}
        style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0 }}
        aria-label="Send Message"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </form>
  );
};

export default ChatInput;
