/**
 * Client-side validation helpers
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
};

export const validateTransaction = (values) => {
  const errors = {};

  if (!values.type || !['income', 'expense'].includes(values.type)) {
    errors.type = 'Please select a valid transaction type';
  }

  const amt = parseFloat(values.amount);
  if (isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number greater than 0';
  } else if (amt > 1000000000) {
    errors.amount = 'Amount cannot exceed ₹1,000,000,000';
  }

  if (!values.category) {
    errors.category = 'Please choose a category';
  }

  if (!values.date) {
    errors.date = 'Date is required';
  }

  if (values.note && values.note.length > 500) {
    errors.note = 'Note cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateBudget = (values) => {
  const errors = {};
  const amt = parseFloat(values.amount);
  if (isNaN(amt) || amt < 1) {
    errors.amount = 'Budget limit must be at least ₹1';
  }
  if (!values.month || values.month < 1 || values.month > 12) {
    errors.month = 'Please select a valid month (1-12)';
  }
  if (!values.year || values.year < 2000 || values.year > 2100) {
    errors.year = 'Please enter a valid year';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
