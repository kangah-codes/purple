export function isNotNilUUID(id: string) {
    return id !== '00000000-0000-0000-0000-000000000000';
}

type KeyOf<T> = keyof T | keyof T[keyof T];

/**
 * Gets the value of a key in an object or nested object.
 *
 * @template T - The type of the object.
 * @template K - The type of the key.
 * @param {T} obj - The object to get the key from.
 * @param {K} key - The key to get the value of.
 * @returns {string} The value of the key as a string, or "undefined" if the key does not exist.
 * @author Joshua Akangah
 */
function getKey<T, K extends KeyOf<T>>(obj: T, key: K): string {
    if (typeof key === 'string') {
        return obj[key as keyof T] as any as string;
    } else {
        let value = obj;
        // @ts-ignore
        for (const k of key) {
            // @ts-ignore
            if (value[k] === undefined) {
                return 'undefined';
            }
            // @ts-ignore
            value = value[k];
        }
        return value as any as string;
    }
}

export function groupBy<T, K extends KeyOf<T>>(arr: T[], key: K): Record<string, T[]> {
    return arr.reduce((acc, obj) => {
        const groupKey = getKey(obj, key);
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(obj);
        return acc;
    }, {} as Record<string, T[]>);
}
