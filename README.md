# FinAI Tracker — Advanced AI-Powered MERN Expense Tracker

![FinAI Tracker Banner](https://img.shields.io/badge/Stack-MERN%20+%20Vite%20+%20Gemini-6366f1)
![Node Version](https://img.shields.io/badge/Node-v18%2B-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248)

A production-grade, full-stack Expense Tracker built on the **MERN** stack (MongoDB Atlas, Express.js, React 19, Node.js) with real-time **Google Gemini AI** integration, budget limits, interactive financial visualizations with Recharts, CSV exports, and strict cross-user data isolation.

---

## 🌟 Key Features

1. **Intelligent AI Finance Chatbox:**
   - Floating AI assistant panel integrated with real Google Gemini LLM.
   - Answers questions regarding personal spending, monthly changes, and savings opportunities using live, authenticated user data.
   - Privacy-first: Strips credentials before sending anonymized summaries to LLM.
   - Graceful fallback: Reports unconfigured state honestly with setup steps if no API key is provided.

2. **Dedicated AI Insights & Analytics:**
   - Month-over-month spending shift metrics.
   - Strategic recommendations and unusual spike detection.
   - Executive financial commentary synthesized from real transactions.

3. **Financial Dashboard & Visualizations:**
   - Live KPI cards: Total Income, Total Expenses, Net Cash Surplus, and Savings Rate.
   - 6-Month Income vs Expense Bar Chart (Recharts).
   - Category distribution Donut Chart with percentage shares.
   - Daily spending velocity area chart.

4. **Complete Transaction Management (CRUD):**
   - Income & expense recording with category assignment and optional notes.
   - Search by note, filter by type, category, month, and year.
   - Sort by date or amount with responsive table pagination.
   - Filtered CSV data export.
   - Recurring transaction scheduling support.

5. **Budget Planning & Alerts:**
   - Overall monthly and category-specific expense limits.
   - Visual progress bars showing live usage and remaining allowances.
   - Warning badges at 80% threshold and instant exceeded alerts.

6. **Enterprise Security & Architecture:**
   - JWT stateless authentication with bcrypt password hashing (10 salt rounds).
   - Rate limiting on authentication and AI endpoints.
   - Helmet security headers and CORS protection.
   - Input validation with `express-validator`.
   - Complete cross-user isolation: No user can access or mutate another user's records.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Context API, Recharts, Lucide React, Vanilla CSS3 tokens |
| **Backend** | Node.js, Express.js, Mongoose, MongoDB Atlas, bcryptjs, jsonwebtoken, express-validator, helmet, express-rate-limit |
| **AI Integration** | Google Generative AI (`@google/generative-ai`), Gemini 1.5 Flash adapter with OpenAI REST fallback |
| **Testing** | Node native test runner (`node:test`, `node:assert`), Supertest |

---

## 📁 Project Folder Structure

```
ai-expense-tracker/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         (Navbar, Sidebar, Footer, LoadingSpinner, ErrorMessage, ConfirmDialog)
│   │   │   ├── dashboard/      (SummaryCard, IncomeExpenseChart, CategoryPieChart, RecentTransactions, BudgetProgress)
│   │   │   ├── transactions/   (TransactionForm, TransactionTable, TransactionFilters, TransactionItem)
│   │   │   ├── chat/           (AIChatWidget, ChatMessage, ChatInput)
│   │   │   └── budgets/        (BudgetCard)
│   │   ├── pages/              (Landing, Register, Login, Dashboard, Transactions, AddTransaction, EditTransaction, Categories, Budgets, Analytics, AIInsights, Profile, NotFound)
│   │   ├── context/            (AuthContext, ThemeContext)
│   │   ├── services/           (api, authService, transactionService, categoryService, budgetService, analyticsService, aiService)
│   │   ├── hooks/              (useAuth, useTransactions)
│   │   ├── utils/              (currency, dateUtils, validation)
│   │   ├── layouts/            (DashboardLayout)
│   │   ├── routes/             (ProtectedRoute)
│   │   ├── styles/             (global.css, variables.css, auth.css, dashboard.css, transactions.css, responsive.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/                 (db.js, aiProvider.js)
│   ├── models/                 (User.js, Transaction.js, Category.js, Budget.js, ChatHistory.js)
│   ├── controllers/            (authController, transactionController, categoryController, budgetController, analyticsController, aiController)
│   ├── routes/                 (authRoutes, transactionRoutes, categoryRoutes, budgetRoutes, analyticsRoutes, aiRoutes)
│   ├── middleware/             (authMiddleware, errorMiddleware, validateRequest, rateLimitMiddleware)
│   ├── services/               (analyticsService, budgetService, aiService)
│   ├── validators/             (authValidator, transactionValidator, budgetValidator)
│   ├── utils/                  (generateToken.js, apiError.js)
│   ├── tests/                  (api.test.js)
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SETUP_GUIDE.md
│   └── PROJECT_ARCHITECTURE.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Configure Backend Environment
Open `backend/.env` and provide your credentials:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_32_character_long_random_jwt_secret_key
CLIENT_URL=http://localhost:5173
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-1.5-flash
```

### 2. Configure Frontend Environment
In `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```
*(Backend runs on **http://localhost:5000** with health endpoint at **http://localhost:5000/api/health**)*

### 4. Start the Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
*(Frontend runs on **http://localhost:5173**)*

---

## 🧪 Testing

Run backend tests verifying health, JWT authentication, validation, ownership security, and unconfigured AI handling:
```bash
cd backend
npm test
```

---

## 📚 Documentation Links

- [REST API Documentation](file:///d:/Project/ai-expense-tracker/docs/API_DOCUMENTATION.md)
- [Database Schema & Collections](file:///d:/Project/ai-expense-tracker/docs/DATABASE_SCHEMA.md)
- [Project Architecture & AI Flow](file:///d:/Project/ai-expense-tracker/docs/PROJECT_ARCHITECTURE.md)
- [Complete Setup & Troubleshooting Guide](file:///d:/Project/ai-expense-tracker/docs/SETUP_GUIDE.md)
