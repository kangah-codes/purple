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

export function splitArrayIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) throw new Error('Chunk size must be greater than 0');
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Removes duplicate objects from an array with O(n) time complexity
 * Works with both primitive values and complex objects
 *
 * @param array The array to deduplicate
 * @param keyFn Optional custom key generation function
 * @returns A new array with duplicates removed
 */
export function dedupe<T>(array: T[], keyFn?: (item: T) => string): T[] {
    if (!array.length) return [];

    if (typeof array[0] !== 'object' || array[0] === null) {
        return [...new Set(array)];
    }

    const seen = new Set<string>();
    const result: T[] = [];

    const getKey =
        keyFn ||
        ((item: T): string => {
            if (typeof item !== 'object' || item === null) {
                return String(item);
            }
            return JSON.stringify(sortObjectKeys(item as any));
        });

    for (const item of array) {
        const key = getKey(item);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }

    return result;
}

/**
 * Recursively sort object keys for deterministic stringification
 */
function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sorted: Record<string, any> = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = sortObjectKeys(obj[key]);
        });

    return sorted;
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
