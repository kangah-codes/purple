type Primitive = string | number | boolean | null | undefined;
type ObjectType = Record<string, unknown>;
type ArrayType = unknown[];
type DeepValueType = Primitive | ObjectType | ArrayType;
type OmitKeys = Array<string | [string, ...string[]]>;

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

/**
 * Updates an array by adding only new, unique items based on deep comparison.
 *
 * @param existingArray - The original array of items.
 * @param newItems - The new items to potentially add to the array.
 * @returns A new array with unique items from both existingArray and newItems.
 */
export function updateArrayWithUniqueItems<T extends DeepObject>(
    existingArray: T[],
    newItems: T[],
): T[] {
    const updatedArray = [...existingArray];

    for (const newItem of newItems) {
        const existingItem = updatedArray.find((item) => deepCompare(item, newItem));
        if (!existingItem) {
            updatedArray.push(newItem);
        }
    }

    return updatedArray;
}

/**
 * ["test"] -> Filter out the "test" value from the form data
 * {
 *  test: {
 *    "abs": "test"
 * }
 * }
 * ["another", ["test", ["abs"]]]
 */

/**
 * @description Function to pre-process form data before submission. this allows us to remove unwanted values from the form data before submission
 * @param {Object} data the form data
 * @param {Array} omit the values to remove from the form data
 * @returns {Object} the pre-processed form data
 * @author Joshua Akangah
 */
export const formPreprocessor = <T extends Record<string, unknown> | Array<unknown>>({
    data,
    omit,
    omitKeys,
}: {
    data: T;
    omit: Array<unknown>;
    omitKeys?: OmitKeys;
}): Partial<T> | T => {
    const hasEmptyArray = omit.some((value) => Array.isArray(value) && value.length === 0);

    const filteredData = Array.isArray(data)
        ? (data.filter((value) => {
              return (
                  !(hasEmptyArray && Array.isArray(value) && value.length === 0) &&
                  !omit.includes(value)
              );
          }) as T)
        : (Object.keys(data || {}).reduce((acc: Record<string, unknown>, key) => {
              // handle nested objects
              if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                  const nestedData = data[key] as Record<string, unknown>;
                  const nestedFilteredData = formPreprocessor({
                      data: nestedData,
                      omit,
                      omitKeys: omitKeys
                          ?.map((omitKey) => {
                              if (Array.isArray(omitKey)) {
                                  const [firstKey, ...restKeys] = omitKey;
                                  if (firstKey === key) {
                                      return restKeys.length > 0 ? restKeys : undefined;
                                  }
                              } else if (omitKey === key) {
                                  return undefined;
                              }
                              return omitKey;
                          })
                          .filter(Boolean) as OmitKeys,
                  });

                  return {
                      ...acc,
                      [key]: nestedFilteredData,
                  };
              }

              const value = data[key] as unknown;

              if (
                  !(hasEmptyArray && Array.isArray(value) && value.length === 0) &&
                  !omit.includes(value) &&
                  !omitKeys?.some((omitKey) => {
                      if (Array.isArray(omitKey)) {
                          const [firstKey, ...restKeys] = omitKey;
                          if (firstKey === key) {
                              return (
                                  restKeys.length === 0 ||
                                  restKeys.reduce(
                                      (obj, k) => (obj as any)[k],
                                      data as Record<string, unknown>,
                                  ) === undefined
                              );
                          }
                      } else if (omitKey === key) {
                          return true;
                      }
                      return false;
                  })
              ) {
                  return {
                      ...acc,
                      [key]: value,
                  };
              }

              return acc;
          }, {}) as T);

    return filteredData as Partial<T> | T;
};
/**
 * @description Function to preprocess a single field from a form
 * @param {Object} data the form data
 * @param {Array} omit the values to remove from the form data
 * @returns {String} the pre-processed form data
 * @author Joshua Akangah
 */
export const fieldPreprocessor = <T extends string>({
    data,
    omit,
}: {
    data: T;
    omit: Array<string | number | boolean | null | undefined>;
}): undefined | T => {
    if (omit.includes(data)) {
        return undefined;
    }

    return data;
};

type KeyMapping<T> = [keyof T, string] | [keyof T, string, (value: T[keyof T]) => any];

type TransformObject<T, U extends KeyMapping<T>[]> = {
    [K in U[number] as K[1]]: K extends [infer OldKey, any, (value: any) => infer R]
        ? R
        : K extends [infer OldKey, any]
        ? OldKey extends keyof T
            ? T[OldKey]
            : never
        : never;
} & Omit<T, U[number][0]>;

export function transformObject<T extends object, U extends KeyMapping<T>[]>(
    obj: T,
    keyMappings: U,
): TransformObject<T, U> {
    const transformedObj: any = { ...obj };
    for (const keyMapping of keyMappings) {
        const [oldKey, newKey, valueTransform] = keyMapping;
        if (oldKey in obj) {
            // Apply transformation if provided
            const value = valueTransform
                ? valueTransform(obj[oldKey as keyof T])
                : obj[oldKey as keyof T];

            // Rename the key with the transformed value
            transformedObj[newKey] = value;

            // Remove the old key only if it's different from the new key
            if (oldKey !== newKey) {
                delete transformedObj[oldKey];
            }
        } else {
            throw new Error(`Key ${String(oldKey)} does not exist in the object.`);
        }
    }
    return transformedObj as TransformObject<T, U>;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): T | Partial<T> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
