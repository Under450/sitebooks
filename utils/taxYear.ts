/**
 * Tax year utilities for UK tax years (April 6 - April 5)
 */

export interface TaxYearInfo {
  label: string;      // "2024/2025"
  startDate: Date;    // April 6, 2024
  endDate: Date;      // April 5, 2025
  startYear: number;  // 2024
  endYear: number;    // 2025
}

/**
 * Get the current UK tax year based on today's date
 */
export function getCurrentTaxYear(): TaxYearInfo {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();
  
  // Tax year starts April 6 (month 3, day 6)
  let startYear: number;
  
  if (currentMonth < 3 || (currentMonth === 3 && currentDay < 6)) {
    // Before April 6 - we're in previous tax year
    startYear = currentYear - 1;
  } else {
    // April 6 or later - we're in current tax year
    startYear = currentYear;
  }
  
  const endYear = startYear + 1;
  
  return {
    label: `${startYear}/${endYear}`,
    startDate: new Date(startYear, 3, 6), // April 6
    endDate: new Date(endYear, 3, 5),     // April 5
    startYear,
    endYear,
  };
}

/**
 * Get a specific tax year by start year
 */
export function getTaxYear(startYear: number): TaxYearInfo {
  const endYear = startYear + 1;
  
  return {
    label: `${startYear}/${endYear}`,
    startDate: new Date(startYear, 3, 6),
    endDate: new Date(endYear, 3, 5),
    startYear,
    endYear,
  };
}

/**
 * Get tax year from a label like "2024/2025"
 */
export function getTaxYearFromLabel(label: string): TaxYearInfo {
  const [startYear] = label.split('/').map(Number);
  return getTaxYear(startYear);
}

/**
 * Determine which tax year a date falls into
 */
export function getTaxYearForDate(date: Date): TaxYearInfo {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // If before April 6, it's in the tax year starting previous year
  if (month < 3 || (month === 3 && day < 6)) {
    return getTaxYear(year - 1);
  }
  
  // Otherwise it's in the tax year starting this year
  return getTaxYear(year);
}

/**
 * Get a list of tax years (for dropdowns)
 */
export function getTaxYearsList(yearsBack: number = 2, yearsForward: number = 1): TaxYearInfo[] {
  const current = getCurrentTaxYear();
  const years: TaxYearInfo[] = [];
  
  for (let i = -yearsBack; i <= yearsForward; i++) {
    years.push(getTaxYear(current.startYear + i));
  }
  
  return years;
}

/**
 * Format a tax year for display
 */
export function formatTaxYear(taxYear: TaxYearInfo): string {
  return taxYear.label;
}

/**
 * Check if a date is within a tax year
 */
export function isDateInTaxYear(date: Date, taxYear: TaxYearInfo): boolean {
  return date >= taxYear.startDate && date <= taxYear.endDate;
}
