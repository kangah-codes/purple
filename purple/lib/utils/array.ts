export function splitArrayIntoSubarrays<T>(arr: T[], subarrays: number): T[][] {
    const subarrayLength = Math.ceil(arr.length / subarrays);
    return Array.from({ length: subarrays }, (_, i) =>
        arr.slice(i * subarrayLength, (i + 1) * subarrayLength),
    );
}
