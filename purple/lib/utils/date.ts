import { endOfMonth, startOfMonth } from 'date-fns';

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
