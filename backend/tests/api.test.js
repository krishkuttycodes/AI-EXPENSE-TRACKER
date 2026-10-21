const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/apiError');
const aiAdapter = require('../config/aiProvider');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_long';

const app = require('../server');

test('Health Check: /api/health returns healthy payload and configuration details', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.ok(res.body.timestamp);
  assert.equal(res.body.environment, 'test');
  assert.ok(res.body.database);
  assert.ok(res.body.aiProvider);
});

test('Token Utility: generateToken signs a valid JWT decipherable by secret', () => {
  const sampleUserId = '64f8c9b2e1f43a0012345678';
  const token = generateToken(sampleUserId);
  assert.ok(token);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.id, sampleUserId);
  assert.ok(decoded.exp);
});

test('ApiError Utility: Correctly formats HTTP errors with codes and messages', () => {
  const badReq = ApiError.badRequest('Invalid transaction amount', [{ field: 'amount', msg: 'Must be positive' }]);
  assert.equal(badReq.statusCode, 400);
  assert.equal(badReq.message, 'Invalid transaction amount');
  assert.equal(badReq.errors.length, 1);

  const unauth = ApiError.unauthorized('No token');
  assert.equal(unauth.statusCode, 401);

  const forbid = ApiError.forbidden('Forbidden action');
  assert.equal(forbid.statusCode, 403);

  const notFoundErr = ApiError.notFound('Budget missing');
  assert.equal(notFoundErr.statusCode, 404);
});

test('Security Middleware: Rejects unauthenticated requests to protected endpoints', async () => {
  const routes = [
    '/api/transactions',
    '/api/categories',
    '/api/budgets',
    '/api/analytics/dashboard',
    '/api/ai/insights',
    '/api/auth/profile',
  ];

  for (const route of routes) {
    const res = await request(app).get(route);
    assert.equal(res.status, 401, `Route ${route} should require authentication`);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('token') || res.body.message.includes('Access denied'));
  }
});

test('Validation: Rejects invalid registration inputs with descriptive error details', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'A', // too short
    email: 'bad-email-format',
    password: '123', // less than 6 chars
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.errors);
  assert.ok(res.body.errors.length >= 3);
});

test('Validation: Rejects empty login credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('AI Adapter: Gracefully flags unconfigured AI provider without throwing or fabricating', () => {
  // When AI_API_KEY is placeholder
  const isConfigured = aiAdapter.isConfigured();
  if (!isConfigured) {
    const unconfigured = aiAdapter.getUnconfiguredMessage();
    assert.equal(unconfigured.configured, false);
    assert.ok(unconfigured.message.includes('AI Financial Assistant'));
    assert.ok(unconfigured.setupInstructions.length > 0);
  }
});

test('404 Handler: Returns clean JSON when accessing unknown endpoints', async () => {
  const res = await request(app).get('/api/some-nonexistent-endpoint');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes('Endpoint not found'));
});
