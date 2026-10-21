# FinAI Expense Tracker — REST API Documentation

This document describes the complete REST API contract for the FinAI Expense Tracker application.

---

## Base URL
```
Development: http://localhost:5000/api
```

## Authentication Scheme
Private routes require a standard Bearer JSON Web Token header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. System & Health Check

### `GET /health`
Returns runtime API health, environment status, MongoDB connection status, and AI configuration state.

- **Access:** Public
- **Response:** `200 OK`
```json
{
  "status": "healthy",
  "message": "AI-Powered Expense Tracker API is running smoothly",
  "timestamp": "2026-10-20T11:47:00.000Z",
  "uptime": 142.5,
  "environment": "development",
  "database": {
    "status": "connected",
    "isReady": true
  },
  "aiProvider": {
    "provider": "gemini",
    "isConfigured": true
  }
}
```

---

## 2. Authentication API (`/auth`)

### `POST /auth/register`
Creates a new user account, hashes password via bcrypt (10 rounds), and auto-seeds standard expense & income starter categories.

- **Access:** Public (Rate limited: 30 requests / 15m)
- **Request Body:**
```json
{
  "name": "Rohan Sharma",
  "email": "rohan@example.com",
  "password": "Password123!",
  "currency": "INR"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "6714a1b...",
      "name": "Rohan Sharma",
      "email": "rohan@example.com",
      "currency": "INR",
      "createdAt": "2026-10-20T11:47:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### `POST /auth/login`
Authenticates existing credentials and issues a signed JWT.

- **Access:** Public (Rate limited: 30 requests / 15m)
- **Request Body:**
```json
{
  "email": "rohan@example.com",
  "password": "Password123!"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "6714a1b...",
      "name": "Rohan Sharma",
      "email": "rohan@example.com",
      "currency": "INR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### `GET /auth/profile`
Returns current authenticated user details.

- **Access:** Private
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### `PUT /auth/profile`
Updates current user's name or display currency.

- **Access:** Private
- **Request Body:**
```json
{
  "name": "Rohan Sharma",
  "currency": "INR"
}
```

---

## 3. Categories API (`/categories`)

### `GET /categories`
Returns all default categories and custom categories created by the user.

- **Access:** Private
- **Query Params:**
  - `type` (optional): `income` | `expense`
- **Response:** `200 OK`

### `POST /categories`
Creates a custom user-owned category.

- **Access:** Private
- **Request Body:**
```json
{
  "name": "Freelance Design",
  "type": "income",
  "icon": "laptop",
  "color": "#06b6d4"
}
```
- **Response:** `201 Created`

### `PUT /categories/:id`
Updates a user-owned custom category (default categories are locked).

- **Access:** Private
- **Response:** `200 OK`

### `DELETE /categories/:id`
Deletes a user custom category (rejects if transactions are attached).

- **Access:** Private
- **Response:** `200 OK`

---

## 4. Transactions API (`/transactions`)

### `GET /transactions`
Fetches filtered and paginated transactions for the authenticated user.

- **Access:** Private
- **Query Parameters:**
  - `type`: `income` | `expense`
  - `category`: Category ObjectId
  - `search`: Keyword in note
  - `month`: 1-12
  - `year`: 2026
  - `startDate`, `endDate`: ISO Date string
  - `sortBy`: `date` | `amount`
  - `sortOrder`: `asc` | `desc`
  - `page`: Page number (default 1)
  - `limit`: Items per page (default 10)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 5,
      "limit": 10
    },
    "summary": {
      "income": 75000,
      "expense": 24500,
      "balance": 50500
    }
  }
}
```

### `POST /transactions`
Records a new income or expense transaction.

- **Access:** Private
- **Request Body:**
```json
{
  "type": "expense",
  "amount": 1450.50,
  "category": "6714a1b02...",
  "note": "Supermarket groceries & coffee",
  "date": "2026-10-20",
  "isRecurring": false,
  "recurringFrequency": "none"
}
```
- **Response:** `201 Created`

### `GET /transactions/:id`
Retrieves a single transaction by ID with ownership verification.

- **Access:** Private
- **Response:** `200 OK`

### `PUT /transactions/:id`
Updates transaction details with ownership verification.

- **Access:** Private
- **Response:** `200 OK`

### `DELETE /transactions/:id`
Permanently deletes transaction.

- **Access:** Private
- **Response:** `200 OK`

### `GET /transactions/export/csv`
Streams filtered transactions as a UTF-8 CSV attachment.

- **Access:** Private
- **Headers:** `Content-Type: text/csv`
- **Response:** `200 OK` (CSV file download)

---

## 5. Budgets API (`/budgets`)

### `GET /budgets`
Retrieves monthly budgets with real spending progress computed dynamically from MongoDB expenses.

- **Access:** Private
- **Query Params:** `month` (1-12), `year` (e.g. 2026)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "month": 10,
    "year": 2026,
    "budgets": [
      {
        "_id": "6714a3...",
        "category": null,
        "amount": 35000,
        "spent": 24500,
        "remaining": 10500,
        "percentageUsed": 70.0,
        "alertThreshold": 80,
        "isWarning": false,
        "isExceeded": false,
        "status": "healthy"
      }
    ]
  }
}
```

### `POST /budgets`
Creates an overall or category-specific budget limit.

- **Access:** Private
- **Request Body:**
```json
{
  "amount": 12000,
  "month": 10,
  "year": 2026,
  "category": "6714a1b...",
  "alertThreshold": 85
}
```

### `PUT /budgets/:id`
Updates limit amount or alert threshold percentage.

- **Access:** Private

### `DELETE /budgets/:id`
Deletes budget record.

- **Access:** Private

---

## 6. Analytics API (`/analytics`)

### `GET /analytics/dashboard`
Returns complete dashboard calculations:
- Summary KPI statistics
- Previous month comparisons & MoM changes
- Category-wise expense breakdown with percentages
- Six-month income vs expense trends
- Daily spending velocity
- Recent 5 transactions
- Budget progress list

- **Access:** Private
- **Query Params:** `month`, `year`
- **Response:** `200 OK`

---

## 7. AI Intelligence API (`/ai`)

### `POST /ai/chat`
Conversational assistant query using Google Gemini. Injects user-specific monthly financial facts into the prompt without leaking personal credentials or external records.

- **Access:** Private (Rate limited: 30 requests / 10m)
- **Request Body:**
```json
{
  "message": "Where did I spend the most money this month?",
  "month": 10,
  "year": 2026
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "configured": true,
    "role": "assistant",
    "message": "Based on your October 2026 records, your highest spending category is Food & Dining at ₹8,400 (34.2% of total expenses). You are currently well within your ₹35,000 overall budget.",
    "timestamp": "2026-10-20T11:47:00.000Z"
  }
}
```

*(Note: When no valid key is configured in `backend/.env`, returns `configured: false` with setup instructions and no fabricated numbers).*

### `GET /ai/insights`
Generates structured financial health metrics, savings recommendations, and optional LLM executive commentary.

- **Access:** Private
- **Query Params:** `month`, `year`

### `GET /ai/history`
Fetches user's conversation history with assistant.

- **Access:** Private

### `DELETE /ai/history`
Clears user's assistant conversation history.

- **Access:** Private
