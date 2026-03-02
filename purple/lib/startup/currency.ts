import { usePreferencesStore } from '@/components/Settings/state';
import CurrencyService from '../services/CurrencyService';

export async function fetchExchangeRates(): Promise<void> {
    try {
        const { currency } = usePreferencesStore.getState().preferences;
        const currencyService = CurrencyService.getInstance();
        await currencyService.fetchExchangeRates(currency.toLowerCase() as any);
        console.log(`[Currency] Exchange rates fetched for ${currency}`);
    } catch (error) {
        console.error('[Currency] Failed to fetch exchange rates:', error);
    }
}
