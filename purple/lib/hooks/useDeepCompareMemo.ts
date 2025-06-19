import { useRef, useMemo } from 'react';
import { deepCompare, DeepObject } from '../utils/object';

export function useDeepCompareMemo<T>(factory: () => T, deps: React.DependencyList): T {
    const previousDepsRef = useRef<React.DependencyList | undefined>();
    const memoizedValueRef = useRef<T>();

    const hasChanged = useMemo(() => {
        if (!previousDepsRef.current) {
            return true;
        }

        if (previousDepsRef.current.length !== deps.length) {
            return true;
        }

        for (let i = 0; i < deps.length; i++) {
            const prevDep = previousDepsRef.current[i];
            const currentDep = deps[i];

            // handle primitive types with regular comparison
            if (
                typeof prevDep !== 'object' ||
                prevDep === null ||
                typeof currentDep !== 'object' ||
                currentDep === null
            ) {
                if (prevDep !== currentDep) {
                    return true;
                }
            } else {
                // use deep comparison for objects
                if (!deepCompare(prevDep as DeepObject, currentDep as DeepObject)) {
                    return true;
                }
            }
        }

        return false;
    }, deps);

    if (hasChanged) {
        memoizedValueRef.current = factory();
        previousDepsRef.current = deps;
    }

    return memoizedValueRef.current!;
}
