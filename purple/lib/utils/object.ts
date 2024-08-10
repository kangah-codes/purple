type Primitive = string | number | boolean | null | undefined;

type ObjectType = Record<string, unknown>;

type ArrayType = unknown[];

type DeepValueType = Primitive | ObjectType | ArrayType;

export type DeepObject = Record<string, DeepValueType>;

/**
 * @description Deeply compares two objects to check if they are equal.
 *
 * @param {object} obj1 - The first object to compare.
 * @param {object} obj2 - The second object to compare.
 * @returns {boolean} - `true` if the objects are equal, `false` otherwise.
 *
 * @example
 * const obj1 = { foo: { bar: [1, 2, 3] } };
 * const obj2 = { foo: { bar: [1, 2, 3] } };
 *
 * deepCompare(obj1, obj2); // truec
 * @author Joshua Akangah
 */
export function deepCompare(obj1: DeepObject, obj2: DeepObject): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (typeof val1 !== typeof val2) {
            return false;
        }

        if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
            if (!deepCompare(val1 as DeepObject, val2 as DeepObject)) {
                return false;
            }
        } else if (val1 !== val2) {
            return false;
        }
    }

    return true;
}
