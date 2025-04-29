import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { useSQLiteContext } from 'expo-sqlite';
import { UseMutationResult, useMutation } from 'react-query';
import { CustomTransactionType, UserPreferences } from './schema';
import { usePreferencesStore } from './state';

export function usePreferences() {
    const { preferences, setPreferences, addCategory } = usePreferencesStore();

    const setPreference = (
        key: keyof UserPreferences,
        value: UserPreferences[keyof UserPreferences],
    ) => {
        setPreferences({ [key]: value });
    };

    return { preferences, setPreference, addCategory };
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
