const aiAdapter = require('../config/aiProvider');
const analyticsService = require('./analyticsService');
const budgetService = require('./budgetService');
const ChatHistory = require('../models/ChatHistory');

class AIService {
  /**
   * Format financial context for LLM prompt safely
   */
  async getSafeFinancialContext(userId, month, year) {
    const summaryData = await analyticsService.getDashboardSummary(userId, month, year);
    const budgetsData = await budgetService.getUserBudgetsWithProgress(userId, month, year);

    const { summary, categoryBreakdown, period } = summaryData;

    // Safe summary lines
    const topCategories = categoryBreakdown.slice(0, 5).map(
      (c) => `- ${c.name}: ₹${c.total.toLocaleString('en-IN')} (${c.percentage}%) across ${c.count} transaction(s)`
    ).join('\n');

    const budgetStatus = budgetsData.map((b) => {
      const name = b.category ? b.category.name : 'Overall Budget';
      return `- ${name}: Spent ₹${b.spent.toLocaleString('en-IN')} of limit ₹${b.amount.toLocaleString('en-IN')} (${b.percentageUsed}% used, Status: ${b.status})`;
    }).join('\n');

    return {
      period,
      summary,
      contextText: `
AUTHENTICATED USER'S ACTUAL FINANCIAL FIGURES FOR ${period.month}/${period.year}:
- Total Monthly Income: ₹${summary.totalIncome.toLocaleString('en-IN')}
- Total Monthly Expenses: ₹${summary.totalExpense.toLocaleString('en-IN')}
- Current Net Savings / Balance: ₹${summary.balance.toLocaleString('en-IN')}
- Calculated Savings Rate: ${summary.savingsRate}%
- Recorded Transactions in Period: ${summary.transactionCount}
- Previous Month Expense: ₹${summary.prevMonthComparison.prevExpense.toLocaleString('en-IN')}
- Month-over-Month Expense Change: ${summary.prevMonthComparison.expenseMoMChange}%

TOP EXPENSE CATEGORIES:
${topCategories || 'No expense categories recorded yet this month.'}

BUDGET PERFORMANCE:
${budgetStatus || 'No budgets configured for this month.'}
`,
    };
  }

  /**
   * Process a chat question with the AI Financial Assistant
   */
  async chat(userId, userMessage, month, year) {
    if (!aiAdapter.isConfigured()) {
      return aiAdapter.getUnconfiguredMessage();
    }

    const { contextText } = await this.getSafeFinancialContext(userId, month, year);

    const systemInstruction = `
You are an advanced, empathetic, and prudent AI Personal Finance Assistant for an Expense Tracker app.
Rules:
1. All figures must strictly match the real financial figures provided in the user's data context below. Never invent, hallucinate, or alter any numbers.
2. If the user asks about something not in the data (e.g. stock market tips, crypto speculations, or unrecorded expenses), state clearly that you only analyze their recorded expense tracker data.
3. Treat yourself as an informational budgeting assistant, not a licensed professional financial adviser. Provide practical, constructive, and realistic savings suggestions.
4. Use Indian Rupees (₹) as the currency symbol.
5. Keep your answer concise, structured with bullet points or short paragraphs, and easy to read on mobile.
6. Never execute payments or financial transactions.

${contextText}
`;

    // Fetch last 6 chat messages for context continuity
    const previousChats = await ChatHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(6);

    const historyPrompt = previousChats.reverse().map((c) => `${c.role.toUpperCase()}: ${c.message}`).join('\n');
    const fullUserPrompt = historyPrompt
      ? `Previous conversation:\n${historyPrompt}\n\nUser Question:\n${userMessage}`
      : userMessage;

    // Call real LLM adapter
    const aiResponseText = await aiAdapter.generateText(systemInstruction, fullUserPrompt);

    // Save history
    await ChatHistory.create([
      { user: userId, role: 'user', message: userMessage },
      { user: userId, role: 'assistant', message: aiResponseText },
    ]);

    return {
      configured: true,
      role: 'assistant',
      message: aiResponseText,
      timestamp: new Date(),
    };
  }

  /**
   * Generate structured AI Insights for the dedicated AI Insights page
   */
  async generateInsights(userId, month, year) {
    const summaryData = await analyticsService.getDashboardSummary(userId, month, year);
    const budgetsData = await budgetService.getUserBudgetsWithProgress(userId, month, year);

    const { summary, categoryBreakdown, period } = summaryData;

    // Check if AI is configured
    const aiReady = aiAdapter.isConfigured();

    // Deterministic rule-based insights always computed correctly
    const insights = {
      period,
      configured: aiReady,
      summary,
      metrics: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
        savingsRate: summary.savingsRate,
        expenseMoMChange: summary.prevMonthComparison.expenseMoMChange,
      },
      topCategories: categoryBreakdown.slice(0, 3),
      budgetAlerts: budgetsData.filter((b) => b.isWarning || b.isExceeded),
      aiAnalysis: null,
      recommendations: [],
    };

    // Deterministic advice items
    if (summary.totalIncome === 0 && summary.totalExpense === 0) {
      insights.recommendations.push({
        type: 'info',
        title: 'Start Tracking',
        text: 'No transactions recorded for this period yet. Add your income and expenses to unlock full financial intelligence.',
      });
    } else {
      if (summary.savingsRate < 20 && summary.totalIncome > 0) {
        insights.recommendations.push({
          type: 'warning',
          title: 'Savings Rate Below 20%',
          text: `Your current savings rate is ${summary.savingsRate}%. Standard financial rules recommend saving at least 20% of your earnings.`,
        });
      } else if (summary.savingsRate >= 30) {
        insights.recommendations.push({
          type: 'success',
          title: 'Healthy Savings Rate',
          text: `Great financial health! You are saving ${summary.savingsRate}% of your income this month.`,
        });
      }

      if (summary.prevMonthComparison.expenseMoMChange > 15) {
        insights.recommendations.push({
          type: 'warning',
          title: 'Spending Spike Detected',
          text: `Your expenses increased by ${summary.prevMonthComparison.expenseMoMChange}% compared to last month. Review your recent transactions.`,
        });
      }

      if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage > 40) {
        insights.recommendations.push({
          type: 'info',
          title: `High Concentration in ${categoryBreakdown[0].name}`,
          text: `${categoryBreakdown[0].percentage}% of your expenses are in "${categoryBreakdown[0].name}". Look for recurring subscriptions or one-off large purchases here.`,
        });
      }
    }

    // If AI is configured, generate synthesized executive commentary
    if (aiReady && summary.transactionCount > 0) {
      try {
        const { contextText } = await this.getSafeFinancialContext(userId, month, year);
        const prompt = `
Analyze the user's financial period summary and generate a structured 3-paragraph executive financial review:
Paragraph 1: Clear monthly summary of balance and savings rate.
Paragraph 2: Deep dive into the highest spending category and month-over-month shifts.
Paragraph 3: Two actionable, realistic suggestions to optimize savings next month.
`;
        const commentary = await aiAdapter.generateText(
          `You are an AI financial analyst. Speak politely, realistically, and objectively without inventing numbers.\n${contextText}`,
          prompt
        );
        insights.aiAnalysis = commentary;
      } catch (err) {
        console.warn('AI analysis generation failed:', err.message);
        insights.aiAnalysis = null;
      }
    }

    return insights;
  }
}

module.exports = new AIService();
