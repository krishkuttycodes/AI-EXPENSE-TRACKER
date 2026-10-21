# FinAI Expense Tracker — Project Architecture

This document describes the architectural design, data pipelines, authentication lifecycle, and AI integration mechanisms of FinAI Tracker.

---

## 1. High-Level Architectural Flow

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite, React Router DOM, Context API, Recharts)     │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ REST Calls (Axios)             │ AI Prompts (Axios)
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js Backend                    │
│   - Security Layer: Helmet, CORS, Rate Limiters        │
│   - JWT Authentication & Input Validation Middleware  │
│   - Controllers: Auth, Tx, Category, Budget, Analytics │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ Mongoose Models                │ Aggregated Financial Facts
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     MongoDB Atlas     │        │  AI Provider Adapter  │
│ - Aggregation Pipeline│        │  - Google Gemini SDK  │
│ - Compound Indexes    │        │  - Fallback Guidance  │
└───────────────────────┘        └───────────────────────┘
```

---

## 2. Authentication Flow

1. **Client Submission:** The user submits credentials via `/login` or `/register`.
2. **Backend Processing:**
   - Input fields validated with `express-validator`.
   - On registration, password is encrypted using `bcrypt.hash(password, 10)` and starter categories are auto-seeded.
   - On login, `bcrypt.compare()` verifies the entered password against the stored hash.
3. **Token Issuance:** A signed JSON Web Token (JWT) is issued with `{ id: user._id }` signed using `JWT_SECRET` with 30 days expiration.
4. **Client State Persistence:** The token is stored in client `localStorage` and attached via Axios request interceptors as `Authorization: Bearer <token>`.
5. **Route Protection:** Protected routes in React (`ProtectedRoute.jsx`) check authentication status, while Express middleware (`authMiddleware.js`) decodes the token and attaches `req.user`.

---

## 3. Financial Analytics Engine

All statistics (income, expenses, balances, savings rate, and category breakdowns) are computed **deterministically** through MongoDB aggregation pipelines in `backend/services/analyticsService.js`:

```
Transactions Match ({ user: ObjectId, date: { $gte, $lte } })
  ├───► $group by 'type' → Total Income, Total Expenses
  ├───► $group by 'category' → Category Breakdown + % Share
  ├───► $group by month / year → 6-Month Income vs Expense Trend
  └───► $group by dayOfMonth → Daily Spending Velocity
```

### Safe Math Guard:
- When income is zero, the savings rate calculation safely returns `0%` to prevent `NaN` or division-by-zero errors.
- Net balance is strictly calculated as `Total Income - Total Expenses`.

---

## 4. AI Finance Assistant Pipeline

```
[User submits question in AIChatWidget]
               │
               ▼
[POST /api/ai/chat with JWT Token]
               │
               ▼
[aiController extracts req.user._id]
               │
               ▼
[aiService queries analyticsService for current month totals]
               │
               ▼
[Anonymized prompt constructed: Real totals, categories & budgets]
               │
               ▼
[AIProviderAdapter calls Gemini 1.5 Flash via official SDK]
               │
               ▼
[LLM Response returned + persisted in ChatHistory]
               │
               ▼
[Client renders structured assistant response in chat bubble]
```

### Privacy & Honesty Guarantees:
- **No Credentials Sent:** AI requests never contain names, emails, passwords, or raw user IDs.
- **No Number Inventions:** The system prompt explicitly binds the LLM to use only the provided deterministic financial metrics.
- **Graceful Unconfigured Mode:** If `AI_API_KEY` is not configured, the backend returns clear setup guidance instead of fabricating AI responses.

---

## 5. Frontend Component Hierarchy

```
App
 ├── ThemeProvider (Dark / Light toggle)
 └── AuthProvider (Session management)
      └── BrowserRouter
           ├── Landing Page
           ├── Auth Pages (Login / Register)
           └── ProtectedRoute
                └── DashboardLayout
                     ├── Navbar (Theme toggle, currency, profile icon)
                     ├── Sidebar (Routes: Dashboard, Transactions, Budgets, Analytics, AI)
                     ├── Page Content (Outlet)
                     ├── Footer
                     └── AIChatWidget (Floating interactive AI assistant)
```
