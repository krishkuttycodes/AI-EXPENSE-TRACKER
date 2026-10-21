# FinAI Expense Tracker — Complete Setup & Configuration Guide

This step-by-step guide explains how to configure and run the full-stack FinAI Expense Tracker on your local machine with MongoDB Atlas and Google Gemini.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Account**: [cloud.mongodb.com](https://cloud.mongodb.com) (Free Shared M0 cluster works perfectly)
- **Google AI Studio Account**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (Free Gemini API key)

---

## 2. MongoDB Atlas Configuration

1. Log into your **MongoDB Atlas Console**.
2. Click **Build a Database** and select the free **M0 Cluster**.
3. **Database Access (User Creation):**
   - Go to **Security > Database Access** > **Add New Database User**.
   - Create a user with **Password Authentication** (e.g., user: `expensetracker_admin`, password: `YourStrongPassword123`).
   - Grant role: **Read and write to any database**.
4. **Network Access (IP Whitelist):**
   - Go to **Security > Network Access** > **Add IP Address**.
   - For local development, click **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP address.
5. **Get Connection String:**
   - Go to **Databases > Cluster > Connect > Drivers > Node.js**.
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and ensure the database name is set to `expense_tracker`.

---

## 3. Google Gemini AI Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy your key (starts with `AIzaSy...`).

---

## 4. Environment Variables Setup

### Backend Environment (`backend/.env`):
Create or edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_32_character_long_random_jwt_secret_key
CLIENT_URL=http://localhost:5173
AI_PROVIDER=gemini
AI_API_KEY=your_actual_gemini_api_key
AI_MODEL=gemini-1.5-flash
```

### Frontend Environment (`frontend/.env`):
Create or edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Starting the Application

You can launch both applications individually or concurrently:

### Option A: Running from Root with npm scripts
```bash
# Terminal 1: Start Backend (Port 5000)
npm run backend:dev

# Terminal 2: Start Frontend (Port 5173)
npm run frontend:dev
```

### Option B: Running individually
```bash
# In the backend directory
cd backend
npm run dev

# In another terminal window, in frontend directory
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your web browser.

---

## 6. Running Automated Tests

Run backend integration and security tests:
```bash
cd backend
npm test
```

Expected output:
```
✔ Health Check: /api/health returns healthy payload
✔ Token Utility: generateToken signs a valid JWT
✔ ApiError Utility: Correctly formats HTTP errors
✔ Security Middleware: Rejects unauthenticated requests to protected endpoints
✔ Validation: Rejects invalid registration inputs
✔ Validation: Rejects empty login credentials
✔ AI Adapter: Gracefully flags unconfigured AI provider without throwing
✔ 404 Handler: Returns clean JSON when accessing unknown endpoints
ℹ pass 8 | fail 0
```

---

## 7. Troubleshooting Guide

| Issue | Cause | Solution |
|---|---|---|
| `MongoServerSelectionError` | Invalid IP or blocked port | Check **Network Access** in Atlas. Ensure `0.0.0.0/0` is active. |
| `Authentication failed` | Wrong DB user or password | Verify user password in `MONGO_URI`. Percent-encode special characters. |
| `AI Provider error` | Missing or invalid key | Ensure `AI_API_KEY` in `backend/.env` has no quotes or extra spaces. |
| `CORS Error in Browser` | Origin mismatch | Confirm `CLIENT_URL=http://localhost:5173` matches your browser port. |
