# FinAI Expense Tracker — Database Schema & Data Modeling

This document details the MongoDB Atlas collection schemas, indexes, relationships, and data isolation policies implemented with Mongoose.

---

## Entity Relationship Overview

```
 ┌───────────────┐
 │     User      │
 └───────┬───────┘
         │ 1:N
         ├───► Category (user: ObjectId | null for global defaults)
         ├───► Transaction (user: ObjectId, category: ObjectId)
         ├───► Budget (user: ObjectId, category: ObjectId | null for overall)
         └───► ChatHistory (user: ObjectId)
```

---

## 1. User Collection (`users`)

Stores user accounts with encrypted credentials and preference settings.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key (Auto-generated) | Unique record ID |
| `name` | String | Required, Trim, Max: 100 | Full name of the user |
| `email` | String | Required, Unique, Lowercase, Regex | Normalized email for login |
| `passwordHash`| String | Required, Select: false | bcrypt hash with 10 salt rounds |
| `currency` | String | Default: `'INR'`, Uppercase | User's preferred currency code |
| `createdAt` | Date | Auto (timestamps) | Account registration date |
| `updatedAt` | Date | Auto (timestamps) | Last profile update date |

### Security Measures:
- `passwordHash` has `select: false` so queries never return password hashes by default.
- Custom `toJSON()` removes `passwordHash` before any API response is serialized.

---

## 2. Category Collection (`categories`)

Stores system starter categories and user-created custom categories.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique category ID |
| `user` | ObjectId | Ref: `'User'`, Default: `null` | Owner ID (`null` = global system default) |
| `name` | String | Required, Trim, Max: 50 | Category title |
| `type` | String | Enum: `['income', 'expense']` | Applicable transaction flow |
| `icon` | String | Default: `'tag'` | Lucide icon identifier |
| `color` | String | Default: `'#6366f1'` | Hex color code for UI cards and charts |
| `isDefault` | Boolean | Default: `false` | Distinguishes protected system templates |
| `createdAt` | Date | Auto (timestamps) | Creation timestamp |
| `updatedAt` | Date | Auto (timestamps) | Last modification timestamp |

### Indexes:
- Compound Unique Index: `{ user: 1, name: 1, type: 1 }` (Prevents duplicate category names per user per transaction type).

---

## 3. Transaction Collection (`transactions`)

Stores income and expense records.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique transaction ID |
| `user` | ObjectId | Required, Ref: `'User'`, Indexed | Authenticated owner ID |
| `type` | String | Required, Enum: `['income', 'expense']` | Transaction direction |
| `amount` | Number | Required, Min: 0.01, Max: 1,000,000,000 | Numerical monetary value |
| `category` | ObjectId | Required, Ref: `'Category'`, Indexed | Associated category |
| `note` | String | Trim, Max: 500, Default: `''` | Optional transaction description |
| `date` | Date | Required, Default: `Date.now`, Indexed | Date of transaction |
| `isRecurring`| Boolean | Default: `false` | Recurring schedule flag |
| `recurringFrequency`| String | Enum: `['none', 'daily', 'weekly', 'monthly', 'yearly']` | Schedule frequency |
| `createdAt` | Date | Auto (timestamps) | Insertion timestamp |
| `updatedAt` | Date | Auto (timestamps) | Last edit timestamp |

### Indexes:
- `{ user: 1, date: -1 }`: Fast retrieval of recent transactions and date-range queries.
- `{ user: 1, type: 1, date: -1 }`: Accelerated income vs expense aggregations.
- `{ user: 1, category: 1, date: -1 }`: High-performance category-wise chart rollups.

---

## 4. Budget Collection (`budgets`)

Stores monthly spending limits and alert thresholds.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique budget ID |
| `user` | ObjectId | Required, Ref: `'User'`, Indexed | Owner ID |
| `category` | ObjectId | Ref: `'Category'`, Default: `null` | Targeted category (`null` = overall monthly budget) |
| `amount` | Number | Required, Min: 1 | Budget spending cap |
| `month` | Number | Required, Min: 1, Max: 12 | Month of budget validity |
| `year` | Number | Required, Min: 2000, Max: 2100 | Year of budget validity |
| `alertThreshold`| Number | Min: 10, Max: 100, Default: 80 | Percentage used before warning status |
| `createdAt` | Date | Auto (timestamps) | Creation timestamp |
| `updatedAt` | Date | Auto (timestamps) | Update timestamp |

### Indexes:
- Compound Unique Index: `{ user: 1, category: 1, month: 1, year: 1 }` (Prevents duplicate budgets for the same category or overall limit in the same month).

---

## 5. Chat History Collection (`chathistories`)

Stores conversational exchanges between the user and the AI assistant.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique message ID |
| `user` | ObjectId | Required, Ref: `'User'`, Indexed | User owner ID |
| `role` | String | Required, Enum: `['user', 'assistant', 'system']` | Author role |
| `message` | String | Required, Max: 4000 chars | Chat text content |
| `timestamp` | Date | Default: `Date.now`, Indexed | Message creation timestamp |

### Indexes:
- `{ user: 1, timestamp: 1 }`: Sequential conversation history retrieval.

---

## Data Isolation & Security Rules

1. **Owner-Bound Queries:** Every query executed in controllers explicitly matches `{ user: req.user._id }`.
2. **Category Ownership Validation:** Before saving transactions or budgets, the backend verifies that the selected category is either a global template (`user: null`) or owned by `req.user._id`.
3. **No Cross-User Leaks:** User B cannot read, update, or delete records belonging to User A, even if guessing the MongoDB ObjectId.
