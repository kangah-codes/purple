import { deepCompare, DeepObject } from './object';

export function splitArrayIntoSubarrays<T>(arr: T[], subarrays: number): T[][] {
    const subarrayLength = Math.ceil(arr.length / subarrays);
    return Array.from({ length: subarrays }, (_, i) =>
        arr.slice(i * subarrayLength, (i + 1) * subarrayLength),
    );
}

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
