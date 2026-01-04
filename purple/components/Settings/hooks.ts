import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { useSQLiteContext } from 'expo-sqlite';
import { UseMutationResult, useMutation } from 'react-query';
import { CustomTransactionType, UserPreferences } from './schema';
import { usePreferencesStore } from './state';
import { useCallback, useRef } from 'react';
import { useDebounce } from '@/lib/utils/debounce';

export function usePreferences() {
    const db = useSQLiteContext();
    const { addCategory, preferences, setPreferences } = usePreferencesStore();
    const pendingWrites = useRef<Map<string, unknown>>(new Map());
    const currency = preferences.currency;

    // debounces function to batch database writes
    const debouncedSaveToDB = useCallback(
        useDebounce(async () => {
            const settingsService = SettingsServiceFactory.create(db);
            const writes = Array.from(pendingWrites.current.entries());
            pendingWrites.current.clear();

            for (const [key, value] of writes) {
                try {
                    await settingsService.set(
                        key as keyof UserPreferences,
                        value as string | boolean | CustomTransactionType[],
                    );
                } catch (error) {
                    console.error(`Failed to save preference ${key}:`, error);
                }
            }
        }, 1000),
        [db],
    );

    const setPreference = useCallback(
        async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
            // Update state immediately for UI responsiveness
            setPreferences({ [key]: value });

            // queue for database write
            pendingWrites.current.set(key, value);
            debouncedSaveToDB();
        },
        [setPreferences, debouncedSaveToDB],
    );

    return {
        preferences: { ...preferences, currency },
        setPreference,
        addCategory,
    };
}

export function useCreateCategory(): UseMutationResult<
    CustomTransactionType,
    Error,
    CustomTransactionType,
    unknown
> {
    const db = useSQLiteContext();

    return useMutation(['create-category'], async (data: CustomTransactionType) => {
        const service = SettingsServiceFactory.create(db);
        return service.createTransactionType(data);
    });
}
