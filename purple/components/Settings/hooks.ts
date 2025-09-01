import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { useSQLiteContext } from 'expo-sqlite';
import { UseMutationResult, useMutation } from 'react-query';
import { CustomTransactionType, UserPreferences } from './schema';
import { usePreferencesStore } from './state';
import { useCallback, useRef } from 'react';
import { useDebounce } from '@/lib/utils/debounce';

export function usePreferences() {
    const preferences = usePreferencesStore((state) => state.preferences);
    const setPreferences = usePreferencesStore((state) => state.setPreferences);
    const pendingWrites = useRef<Map<string, any>>(new Map());
    const currency = preferences.currency || 'USD';

    // debounces function to batch database writes
    const debouncedSaveToDB = useCallback(
        useDebounce(async () => {
            const settingsService = SettingsServiceFactory.create(useSQLiteContext());
            const writes = Array.from(pendingWrites.current.entries());
            pendingWrites.current.clear();

            for (const [key, value] of writes) {
                await settingsService.set(key as keyof UserPreferences, value);
            }
        }, 1000),
        [],
    );

    const setPreference = useCallback(
        async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
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
