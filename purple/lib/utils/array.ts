import { deepCompare, DeepObject } from './object';

/**
 * Splits an array into a specified number of subarrays.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The array to be split into subarrays.
 * @param {number} subarrays - The number of subarrays to create.
 * @returns {T[][]} An array containing the subarrays.
 *
 * @example
 * ```typescript
 * const result = splitArrayIntoSubarrays([1, 2, 3, 4, 5], 2);
 * // result is [[1, 2, 3], [4, 5]]
 * ```
 */
export function splitArrayIntoSubarrays<T>(arr: T[], subarrays: number): T[][] {
    const subarrayLength = Math.ceil(arr.length / subarrays);
    return Array.from({ length: subarrays }, (_, i) =>
        arr.slice(i * subarrayLength, (i + 1) * subarrayLength),
    );
}

/**
 * Removes duplicate objects from an array based on deep comparison.
 *
 * @template T - The type of objects in the array, extending DeepObject.
 * @param {T[]} array - The array from which to remove duplicates.
 * @returns {T[]} A new array with duplicates removed.
 */
export function dedupe<T extends DeepObject>(array: T[]): T[] {
    const result: T[] = [];

    for (const item of array) {
        // Check if the current item is already present in the result array
        if (!result.some((existingItem) => deepCompare(item, existingItem))) {
            result.push(item); // Add to result if not a duplicate
        }
    }

    return result;
}

type KeyOf<T> = keyof T | keyof T[keyof T];
/**
 * Removes duplicate objects from an array based on a specified key.
 *
 * @template T - The type of objects in the array.
 * @template K - The key of the object to deduplicate by.
 * @param {T[]} array - The array of objects to deduplicate.
 * @param {K} key - The key to use for deduplication.
 * @returns {T[]} A new array with duplicates removed based on the specified key.
 */
export function dedupeByKey<T, K extends KeyOf<T>>(array: T[], key: K): T[] {
    const result: T[] = [];
    const seen = new Set();

    for (const item of array) {
        const value = (item as any)[key];
        if (seen.has(value)) {
            continue;
        }

        seen.add(value);
        result.push(item);
    }

    return result;
}
