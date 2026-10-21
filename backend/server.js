const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, isDbConnected } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Security Middlewares
app.use(helmet());

// CORS configuration
const allowedOrigins = [
process.env.CLIENT_URL || 'http://localhost:5173',
'http://localhost:5173',
'http://127.0.0.1:5173',
'https://ai-expense-tracker-1-ss5b.onrender.com',
];


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiter
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = isDbConnected();
  res.status(200).json({
    status: 'healthy',
    message: 'AI-Powered Expense Tracker API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      isReady: dbConnected,
    },
    aiProvider: {
      provider: process.env.AI_PROVIDER || 'gemini',
      isConfigured: Boolean(
        process.env.AI_API_KEY &&
        !process.env.AI_API_KEY.includes('PASTE_YOUR_AI_PROVIDER_KEY_HERE')
      ),
    },
  });
});

// Mount Feature Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

// Port setup
const PORT = process.env.PORT || 5000;

let server;

// Connect to MongoDB Atlas and start server
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 [Server Running] Port ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 [Client URL] ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }
});

module.exports = app;
