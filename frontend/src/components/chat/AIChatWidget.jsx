import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Trash2, Bot } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import aiService from '../../services/aiService';

const SUGGESTED_QUESTIONS = [
  'Where did I spend the most money this month?',
  'Compare my expenses with last month.',
  'Which category has the highest spending?',
  'Am I staying within my budget?',
  'Summarise my financial activity this month.',
  'How can I reduce unnecessary expenses?',
];

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: 'Hello! I am your AI Finance Assistant. I can analyze your transactions, check budget health, and find savings opportunities. What would you like to know?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load chat history when widget opens
  useEffect(() => {
    if (isOpen && messages.length <= 1) {
      const loadHistory = async () => {
        try {
          const res = await aiService.getHistory();
          if (res.success && res.data?.history && res.data.history.length > 0) {
            setMessages(res.data.history);
          }
        } catch {
          // Keep welcome message
        }
      };
      loadHistory();
    }
  }, [isOpen]);

  const handleSendMessage = async (userPrompt) => {
    const userMsg = { role: 'user', message: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const now = new Date();
      const res = await aiService.chat(userPrompt, now.getMonth() + 1, now.getFullYear());

      if (res.success && res.data) {
        if (!res.data.configured) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              message: res.data.message,
              setupInstructions: res.data.setupInstructions,
              isUnconfiguredNotice: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              message: res.data.message,
            },
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: err.message || 'Sorry, I encountered an error connecting to the AI service. Please verify your backend configuration.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiService.clearHistory();
    } catch {
      // Ignored
    }
    setMessages([
      {
        role: 'assistant',
        message: 'Conversation cleared! How can I help you analyze your finances today?',
      },
    ]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="ai-fab"
        title="Open AI Finance Chat"
        aria-label="AI Finance Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {isOpen && (
        <div className="ai-chat-panel animate-fade-in">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4>FinAI Assistant</h4>
                <p>Personal Finance Intelligence</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={handleClearHistory}
                className="btn btn-icon btn-sm"
                style={{ color: '#ffffff', opacity: 0.8 }}
                title="Clear Chat History"
                aria-label="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-icon btn-sm"
                style={{ color: '#ffffff' }}
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                <Sparkles size={14} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
                <span>FinAI is reviewing your financial records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0.5rem 0.875rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Suggested Questions:
            </div>
            <div className="suggested-prompts">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="suggested-chip"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <ChatInput onSend={handleSendMessage} loading={loading} />
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
