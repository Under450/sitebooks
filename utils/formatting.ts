/**
 * Format a number as GBP currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('en-GB', options).format(d);
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse a UK date string (DD/MM/YYYY or similar)
 */
export function parseDate(dateString: string): Date | null {
  // Try ISO format first
  if (dateString.includes('-')) {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Try DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  
  return null;
}

/**
 * Calculate VAT amount from total (assuming 20% VAT)
 */
export function calculateVAT(total: number): number {
  // VAT = Total × (VAT rate / (100 + VAT rate))
  // For 20% VAT: Total × (20/120) = Total × 0.1667
  return Math.round(total * (20 / 120) * 100) / 100;
}

/**
 * Calculate net amount (excluding VAT)
 */
export function calculateNet(total: number): number {
  return total - calculateVAT(total);
}

/**
 * Format mileage
 */
export function formatMiles(miles: number): string {
  return `${miles.toFixed(1)} miles`;
}

/**
 * Calculate HMRC mileage deduction
 * 45p per mile for first 10,000 miles
 * 25p per mile after that
 */
export function calculateMileageDeduction(miles: number, totalMilesThisYear: number = 0): number {
  const RATE_UNDER_10K = 0.45;
  const RATE_OVER_10K = 0.25;
  const THRESHOLD = 10000;
  
  const previousMiles = totalMilesThisYear - miles;
  let deduction = 0;
  
  if (previousMiles >= THRESHOLD) {
    // All miles are over the threshold
    deduction = miles * RATE_OVER_10K;
  } else if (previousMiles + miles <= THRESHOLD) {
    // All miles are under the threshold
    deduction = miles * RATE_UNDER_10K;
  } else {
    // Miles span the threshold
    const milesUnderThreshold = THRESHOLD - previousMiles;
    const milesOverThreshold = miles - milesUnderThreshold;
    deduction = (milesUnderThreshold * RATE_UNDER_10K) + (milesOverThreshold * RATE_OVER_10K);
  }
  
  return Math.round(deduction * 100) / 100;
}
