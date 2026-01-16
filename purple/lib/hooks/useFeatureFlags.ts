import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FEATURE_FLAGS, FeatureFlagName, FeatureFlagDefinition } from '../constants/featureFlags';

type FlagChangeListener = (name: FeatureFlagName, enabled: boolean) => void;
const flagChangeListeners = new Set<FlagChangeListener>();

const emitFlagChange = (name: FeatureFlagName, enabled: boolean) => {
    flagChangeListeners.forEach((listener) => listener(name, enabled));
};

const subscribeFlagChange = (listener: FlagChangeListener) => {
    flagChangeListeners.add(listener);
    return () => flagChangeListeners.delete(listener);
};

type FeatureFlagState = {
    [key: string]: boolean;
};

type FeatureFlagRow = {
    name: string;
    enabled: number;
    description: string | null;
};

export function useFeatureFlags() {
    const db = useSQLiteContext();
    const [flags, setFlags] = useState<FeatureFlagState>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadFlags = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // init with defaults
            const defaultFlags: FeatureFlagState = {};
            for (const flag of FEATURE_FLAGS) {
                defaultFlags[flag.name] = flag.defaultEnabled;
            }

            try {
                const rows = await db.getAllAsync<FeatureFlagRow>(
                    'SELECT name, enabled FROM feature_flags',
                );

                for (const row of rows) {
                    defaultFlags[row.name] = row.enabled === 1;
                }
            } catch {
                console.log('[useFeatureFlags] Could not load flags from DB, using defaults');
            }

            setFlags(defaultFlags);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load feature flags'));
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
        loadFlags();
    }, [loadFlags]);

    const ensureFlagExists = useCallback(
        async (name: FeatureFlagName) => {
            const definition = FEATURE_FLAGS.find((f) => f.name === name);
            if (!definition) return;

            try {
                await db.runAsync(
                    `INSERT OR IGNORE INTO feature_flags (name, enabled, description) VALUES (?, ?, ?)`,
                    [name, definition.defaultEnabled ? 1 : 0, definition.description],
                );
            } catch {
                // Ignore errors - table might not exist
            }
        },
        [db],
    );

    // Set a specific flag value
    const setFlag = useCallback(
        async (name: FeatureFlagName, enabled: boolean): Promise<boolean> => {
            try {
                await ensureFlagExists(name);

                await db.runAsync(
                    `INSERT INTO feature_flags (name, enabled, description, updated_at)
                     VALUES (?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime'))
                     ON CONFLICT(name) DO UPDATE SET
                        enabled = excluded.enabled,
                        updated_at = excluded.updated_at`,
                    [
                        name,
                        enabled ? 1 : 0,
                        FEATURE_FLAGS.find((f) => f.name === name)?.description ?? null,
                    ],
                );

                setFlags((prev) => ({ ...prev, [name]: enabled }));
                emitFlagChange(name, enabled);
                return true;
            } catch (err) {
                console.error('[useFeatureFlags] Failed to set flag:', err);
                setError(err instanceof Error ? err : new Error('Failed to set feature flag'));
                return false;
            }
        },
        [db, ensureFlagExists],
    );

    // Toggle a flag
    const toggleFlag = useCallback(
        async (name: FeatureFlagName): Promise<boolean> => {
            const currentValue = flags[name] ?? false;
            return setFlag(name, !currentValue);
        },
        [flags, setFlag],
    );

    // Get a specific flag value
    const getFlag = useCallback(
        (name: FeatureFlagName): boolean => {
            return (
                flags[name] ?? FEATURE_FLAGS.find((f) => f.name === name)?.defaultEnabled ?? false
            );
        },
        [flags],
    );

    // Get all flags with their definitions
    const getAllFlags = useCallback((): Array<FeatureFlagDefinition & { enabled: boolean }> => {
        return FEATURE_FLAGS.map((definition) => ({
            ...definition,
            enabled: flags[definition.name] ?? definition.defaultEnabled,
        }));
    }, [flags]);

    // Reset all flags to defaults
    const resetAllFlags = useCallback(async (): Promise<boolean> => {
        try {
            await db.runAsync('DELETE FROM feature_flags');

            const defaultFlags: FeatureFlagState = {};
            for (const flag of FEATURE_FLAGS) {
                defaultFlags[flag.name] = flag.defaultEnabled;
            }
            setFlags(defaultFlags);
            return true;
        } catch (err) {
            console.error('[useFeatureFlags] Failed to reset flags:', err);
            setError(err instanceof Error ? err : new Error('Failed to reset feature flags'));
            return false;
        }
    }, [db]);

    return {
        flags,
        isLoading,
        error,
        setFlag,
        toggleFlag,
        getFlag,
        getAllFlags,
        resetAllFlags,
        refresh: loadFlags,
    };
}

export function useFeatureFlag(name: FeatureFlagName): boolean {
    const db = useSQLiteContext();
    const [enabled, setEnabled] = useState<boolean>(() => {
        const definition = FEATURE_FLAGS.find((f) => f.name === name);
        return definition?.defaultEnabled ?? false;
    });

    useEffect(() => {
        let mounted = true;

        const loadFlag = async () => {
            try {
                const row = await db.getFirstAsync<{ enabled: number }>(
                    'SELECT enabled FROM feature_flags WHERE name = ? LIMIT 1',
                    [name],
                );

                if (mounted) {
                    if (row) {
                        setEnabled(row.enabled === 1);
                    } else {
                        // Use default from definition
                        const definition = FEATURE_FLAGS.find((f) => f.name === name);
                        setEnabled(definition?.defaultEnabled ?? false);
                    }
                }
            } catch {
                // Table might not exist, use default
                if (mounted) {
                    const definition = FEATURE_FLAGS.find((f) => f.name === name);
                    setEnabled(definition?.defaultEnabled ?? false);
                }
            }
        };

        loadFlag();

        // sub to changes from other components
        const unsubscribe = subscribeFlagChange((changedName, newValue) => {
            if (mounted && changedName === name) {
                setEnabled(newValue);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [db, name]);

    return enabled;
}
