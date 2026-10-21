/**
 * Currency formatting utility supporting Indian Rupee (INR) and international currencies
 */

/**
 * Format a numeric amount with currency symbol and Indian grouping format (e.g. ₹1,25,000.00)
 * @param {number|string} amount 
 * @param {string} currencyCode Default 'INR'
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `₹${numericAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

/**
 * Format compact amounts for charts and cards (e.g. ₹1.5L, ₹45K)
 * @param {number} amount 
 * @returns {string} Compact formatted string
 */
export const formatCompactCurrency = (amount) => {
  const num = Math.abs(Number(amount)) || 0;
  const sign = Number(amount) < 0 ? '-' : '';

  if (num >= 10000000) {
    return `${sign}₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `${sign}₹${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${sign}₹${(num / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${num.toFixed(0)}`;
};
