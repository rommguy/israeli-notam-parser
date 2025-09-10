import { format, addDays, parseISO } from 'date-fns';

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export const getTomorrowString = (): string => {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
};

/**
 * Get the file path for NOTAM data based on date selection
 */
export const getNotamDataPath = (dateSelection: 'today' | 'tomorrow'): string => {
  const dateString = dateSelection === 'today' ? getTodayString() : getTomorrowString();
  return `/data/${dateString}.json`;
};

/**
 * Format a date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, MMMM do, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Get display label for date selection
 */
export const getDateDisplayLabel = (dateSelection: 'today' | 'tomorrow'): string => {
  if (dateSelection === 'today') {
    return `Today (${formatDateForDisplay(getTodayString())})`;
  } else {
    return `Tomorrow (${formatDateForDisplay(getTomorrowString())})`;
  }
};

/**
 * Check if a date string represents today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Check if a date string represents tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
  return dateString === getTomorrowString();
};

/**
 * Parse date from NOTAM data (handles string dates from JSON)
 */
export const parseNotamDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  try {
    return parseISO(dateString);
  } catch (error) {
    return new Date(dateString);
  }
};
