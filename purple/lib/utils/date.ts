import {
    endOfDay,
    endOfMonth,
    startOfDay,
    startOfMonth,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from 'date-fns';

export function formatDate(
    date: string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
    return new Date(date).toLocaleDateString(undefined, options);
}

import { format, isToday, isYesterday, parse } from 'date-fns';

export function formatDateTime(
    inputDateStr: string | undefined,
    showRelative: boolean = true,
): { date: string; time: string } {
    if (!inputDateStr) return { date: '', time: '' };

    let inputDate: Date;

    // Try to parse as yyyyMMdd format first
    const yyyyMMddRegex = /^\d{8}$/;
    if (yyyyMMddRegex.test(inputDateStr)) {
        inputDate = parse(inputDateStr, 'yyyyMMdd', new Date());
    } else {
        inputDate = new Date(inputDateStr);
        if (isNaN(inputDate.getTime())) return { date: '', time: '' }; // Invalid date
    }

    const currentDate = new Date();

    // Format time
    const time = format(inputDate, 'hh:mm a');

    if (showRelative) {
        if (isToday(inputDate)) {
            return { date: 'Today', time };
        }

        if (isYesterday(inputDate)) {
            return { date: 'Yesterday', time };
        }
    }

    // Format date (e.g. 18 Apr or 18 Apr 2023 if not same year)
    const dateFormat =
        inputDate.getFullYear() !== currentDate.getFullYear() ? 'd MMM yyyy' : 'd MMM';

    const formattedDate = format(inputDate, dateFormat);

    return { date: formattedDate, time };
}

/**
 * Converts a valid string to a JS date
 * @param dateStr {string} The string
 * @returns {Date | null} a js date/ or null if an error occurs
 */
export function convertToJSDate(dateStr: string): Date | null {
    try {
        // Split the input string into day, month, and year
        const parts = dateStr.split('/');
        if (parts.length !== 3) {
            console.error('Invalid date format. Expected DD/MM/YY.');
            return null;
        }

        const [day, month, year] = parts;

        // Convert two-digit year to four-digit year
        const fullYear = 2000 + parseInt(year, 10);

        // Create the Date object (months are 0-indexed in JavaScript)
        const jsDate = new Date(fullYear, Number(month) - 1, Number(day));

        // Validate the date
        const isValidDate =
            jsDate.getFullYear() === fullYear &&
            jsDate.getMonth() === Number(month) - 1 &&
            jsDate.getDate() === Number(day);

        if (!isValidDate) {
            console.error('Invalid date.');
            return null;
        }

        return jsDate;
    } catch (error) {
        console.error('An error occurred while parsing the date:', error);
        return null;
    }
}

/**
 * Time period strings representing different date ranges
 */
export type TimePeriod = '1W' | '1D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

/**
 * Interface representing a date range with start and end dates
 */
interface DateRange {
    startDate: Date;
    endDate: Date;
}

export function getDateRange(period: TimePeriod): DateRange {
    const now = new Date();
    const endDate = endOfDay(now);
    let startDate: Date;

    switch (period) {
        case '1D':
            startDate = subDays(now, 1);
            break;
        case '1W':
            startDate = subWeeks(now, 1);
            break;
        case '1M':
            startDate = subMonths(now, 1);
            break;
        case '3M':
            startDate = subMonths(now, 3);
            break;
        case '6M':
            startDate = subMonths(now, 6);
            break;
        case '1Y':
            startDate = subYears(now, 1);
            break;
        case 'ALL':
            startDate = new Date(0);
            break;
        default:
            startDate = now;
            break;
    }

    startDate = startOfDay(startDate);

    return {
        startDate,
        endDate,
    };
}

export function dateToUNIX(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}
