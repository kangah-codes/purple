export function formatDate(
    date: string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
    return new Date(date).toLocaleDateString(undefined, options);
}

export function formatDateTime(
    inputDateStr: string | undefined,
    showRelative: boolean = true,
): { date: string; time: string } {
    if (!inputDateStr) return { date: '', time: '' };

    const inputDate = new Date(inputDateStr);
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    // Format time
    const time = inputDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    // Check if date is today or yesterday (only if showRelative is true)
    if (showRelative) {
        if (
            inputDate.getDate() === currentDate.getDate() &&
            inputDate.getMonth() === currentDate.getMonth() &&
            inputDate.getFullYear() === currentDate.getFullYear()
        ) {
            return { date: 'Today', time };
        }

        if (
            inputDate.getDate() === yesterday.getDate() &&
            inputDate.getMonth() === yesterday.getMonth() &&
            inputDate.getFullYear() === yesterday.getFullYear()
        ) {
            return { date: 'Yesterday', time };
        }
    }

    // Format date
    const month = inputDate.toLocaleString('en-US', { month: 'short' });
    const date = inputDate.getDate();
    const year = inputDate.getFullYear();
    const currentYear = currentDate.getFullYear();

    // Only include year if the date is from a different year
    const formattedDate = year !== currentYear ? `${date} ${month} ${year}` : `${date} ${month}`;

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
