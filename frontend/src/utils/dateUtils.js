/**
 * Date and time manipulation utilities for Expense Tracker
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a Date object or ISO string to readable format (e.g. "20 Oct 2026")
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const month = MONTH_SHORT_NAMES[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format ISO string to input date format "YYYY-MM-DD"
 */
export const toInputDateFormat = (dateValue) => {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
};

/**
 * Get month name and year label (e.g. "October 2026")
 */
export const formatMonthYear = (month, year) => {
  const m = parseInt(month, 10);
  const monthName = MONTH_NAMES[m - 1] || '';
  return `${monthName} ${year}`;
};

/**
 * Get current month and year
 */
export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

/**
 * Generate month dropdown options
 */
export const getMonthOptions = () => {
  return MONTH_NAMES.map((name, index) => ({
    value: index + 1,
    label: name,
  }));
};

/**
 * Generate year dropdown options (e.g., from 3 years ago to current year + 1)
 */
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    years.push({ value: y, label: String(y) });
  }
  return years;
};
