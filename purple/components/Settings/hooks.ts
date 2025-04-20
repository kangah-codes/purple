import { useStore } from 'zustand';
import { createPreferencesStore } from './state';

export function usePreferences() {
    const [currency, setPreferences] = useStore(createPreferencesStore, (state) => [
        state.currency,
        state.setPreferences,
    ]);

    return { currency, setPreferences };
}
