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

    const item = lookup
        .slice()
        .reverse()
        .find((item) => num >= item.value);

    return item
        ? (num / item.value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + item.symbol
        : '0';
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
) => {
    if (!currency || currency === '' || currency.toLocaleLowerCase() === 'all') return 'N/A';

    if (amount === undefined || amount === null || currency === undefined || currency === '')
        return 'N/A';

    const formattedValue = numberFormatter(amount, dp);
    return `${currency} ${formattedValue}`;
};

/**
 * @description Function to format a number as a currency string to an accurate value
 * @param {Number} amount the amount to be formatted
 * @param {CurrencyCode} currency the currency to be used
 * @returns {String} the formatted amount
 * @author Joshua Akangah
 */
export function formatCurrencyAccurate(currency: string, amount: number) {
    if (!currency || currency === '' || currency.toLocaleLowerCase() === 'all') return 'N/A';

    if (amount === undefined || currency === undefined || currency === '') return 'N/A';

    try {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
        }).format(isNaN(amount) ? 0 : amount);
    } catch (error) {
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
