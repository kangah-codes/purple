/**
 * @description Formats a number to the next largest unit
 * @param {number} num The number to format
 * @param {number} digits The number of digits to show after the decimal point
 * @returns {string} The formatted number
 * @author Joshua Akangah
 */
export const numberFormatter = (num: number, digits: number): string => {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
    ];

    // Handle the case when num is exactly 0
    if (num === 0) return '0';

    // Take the absolute value for comparison, but keep track of sign
    const isNegative = num < 0;
    const absNum = Math.abs(num);

    const item = lookup
        .slice()
        .reverse()
        .find((item) => absNum >= item.value);

    if (!item) return num.toString();

    const formattedNumber = (absNum / item.value)
        .toFixed(digits)
        .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1');

    return isNegative ? `-${formattedNumber}${item.symbol}` : `${formattedNumber}${item.symbol}`;
};

/**
 * @description Function to format a number as a currency string to a rounded value
 * @param {Number} amount the amount to be formatted
 * @param {CurrencyCode} currency the currency to be used
 * @returns {String} the formatted amount
 * @author Joshua Akangah
 */
export const formatCurrencyRounded = (
    amount: number | undefined | null,
    currency: string | undefined | null,
    dp: number = 2,
): string => {
    // NOTE: idk why I filter out ALL currency code
    // if (!currency || currency === '' || currency.toLocaleLowerCase() === 'all') return 'N/A';
    if (!currency || currency === '') return 'N/A';
    if (!amount || amount === 0) return `${currency} 0`;
    if (amount < 0.01 && amount > 0) return `${currency} 0.01`;

    if (amount === undefined || amount === null || currency === undefined || currency === '')
        return 'N/A';

    const formattedValue = numberFormatter(amount, dp);
    return `${currency} ${formattedValue}`;
};

export function formatNumberRounded(amount: number | undefined | null, dp: number = 2): string {
    const formattedValue = numberFormatter(amount ?? 0, dp);
    return `${formattedValue}`;
}

/**
 * @description Function to format a number as a currency string to an accurate value
 * @param {Number} amount the amount to be formatted
 * @param {CurrencyCode} currency the currency to be used
 * @returns {String} the formatted amount
 * @author Joshua Akangah
 */
export function formatCurrencyAccurate(currency: string, amount: number): string {
    if (!currency || currency === '' || currency.toLocaleLowerCase() === 'all') return 'N/A';

    if (amount === undefined || currency === undefined || currency === '') return 'N/A';

    try {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
        }).format(isNaN(amount) ? 0 : amount);
    } catch {
        console.error(`Invalid currency code: ${currency}`);
        return 'N/A';
    }
}

/**
 * Extracts a key from an object based on the given index.
 *
 * @template T - The type of the object.
 * @param _object - The object from which to extract the key.
 * @param index - The index used to extract the key.
 * @returns The extracted key as a string.
 */
export function keyExtractor<T>(_object: T, index: number): string {
    return `${index}`;
}
