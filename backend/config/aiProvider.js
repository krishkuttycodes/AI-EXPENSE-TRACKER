const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Provider Adapter
 * Configurable via environment variables:
 * - AI_PROVIDER: 'gemini' | 'openai' | 'groq'
 * - AI_API_KEY: Secret key for LLM provider
 * - AI_MODEL: Model name (e.g., 'gemini-1.5-flash', 'gpt-4o-mini', etc.)
 */
class AIProviderAdapter {
  constructor() {
    this.provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    this.apiKey = process.env.AI_API_KEY || '';
    this.modelName = process.env.AI_MODEL || (this.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');
  }

  /**
   * Check if the AI provider has a real valid key configured
   */
  isConfigured() {
    return (
      Boolean(this.apiKey) &&
      !this.apiKey.includes('PASTE_YOUR_AI_PROVIDER_KEY_HERE') &&
      !this.apiKey.includes('your_ai_api_key') &&
      this.apiKey.trim().length > 10
    );
  }

  /**
   * Get setup guidance when AI provider key is not configured
   */
  getUnconfiguredMessage() {
    return {
      configured: false,
      message: 'AI Financial Assistant is currently inactive. Please configure a valid AI_API_KEY in backend/.env to unlock real-time financial chat and intelligent budget advice.',
      setupInstructions: [
        '1. Get a Gemini API key at: https://aistudio.google.com/app/apikey (free tier available)',
        '2. Open backend/.env in your project editor',
        '3. Set AI_PROVIDER=gemini',
        '4. Set AI_API_KEY=your_actual_key_here',
        '5. Set AI_MODEL=gemini-1.5-flash',
        '6. Restart the backend server'
      ]
    };
  }

  /**
   * Send prompt with system instructions to the configured LLM provider
   * @param {string} systemInstruction 
   * @param {string} prompt 
   * @returns {Promise<string>}
   */
  async generateText(systemInstruction, prompt) {
    if (!this.isConfigured()) {
      const err = new Error('AI provider is not configured. Please supply an AI_API_KEY in backend/.env.');
      err.code = 'AI_NOT_CONFIGURED';
      throw err;
    }

    if (this.provider === 'gemini') {
      try {
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({
          model: this.modelName,
          systemInstruction: systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err) {
        console.error('Gemini API call failed:', err.message);
        throw new Error(`AI Provider (${this.provider}) error: ${err.message}`);
      }
    } else if (this.provider === 'openai' || this.provider === 'groq') {
      // Direct REST compatibility for OpenAI or Groq
      const baseUrl = this.provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI Provider API responded with status ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } else {
      throw new Error(`Unsupported AI_PROVIDER: "${this.provider}". Supported providers: gemini, openai, groq.`);
    }
  }
}

const aiAdapter = new AIProviderAdapter();

module.exports = aiAdapter;
