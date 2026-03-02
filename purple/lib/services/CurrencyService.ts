import { usePreferencesStore } from '@/components/Settings/state';
import { currencies } from '../constants/currencies';
import { NativeStorage } from '../utils/storage';

type CurrencyCode = Lowercase<(typeof currencies)[number]['code']>;
export type CurrencyRates = {
    date: string;
} & {
    [C in CurrencyCode]?: Record<CurrencyCode, number>;
};
type CurrencyConversionArgs = {
    from: {
        currency: CurrencyCode;
        amount: number;
    };
    to: {
        currency: CurrencyCode;
    };
};

export default class CurrencyService {
    private nativeStorage: NativeStorage;
    private static instance: CurrencyService;

    constructor() {
        this.nativeStorage = NativeStorage.getInstance();
    }

    static getInstance(): CurrencyService {
        if (!CurrencyService.instance) {
            CurrencyService.instance = new CurrencyService();
        }

        return this.instance;
    }

    public async fetchExchangeRates(code?: CurrencyCode): Promise<void> {
        const { currency } = usePreferencesStore.getState().preferences;
        const res = await fetch(
            // TODO: remove hardcoded api endpoints, too lazy to bootstrap app config rn
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${
                code ? code.toLowerCase() : currency.toLowerCase()
            }.json`,
        );
        if (!res.ok) {
            console.error(`Failed to fetch exchange rates: ${res.status}`);
        }

        const data: CurrencyRates = await res.json();
        this.nativeStorage.setItem('currency-exchange-rates', data);
    }

    public async convertCurrencyAsync({ from, to }: CurrencyConversionArgs): Promise<number> {
        try {
            const fromCurrency = from.currency.toLowerCase() as CurrencyCode;
            const toCurrency = to.currency.toLowerCase() as CurrencyCode;

            if (fromCurrency === toCurrency) return from.amount;

            let rates = this.nativeStorage.getItem<CurrencyRates>('currency-exchange-rates');

            // Try direct rate first
            const directRate = rates?.[fromCurrency]?.[toCurrency];
            if (directRate) return from.amount * directRate;

            // Try inverse rate from cached data
            const inverseRate = rates?.[toCurrency]?.[fromCurrency];
            if (inverseRate) return from.amount * (1 / inverseRate);

            // No cached rate found — fetch rates for the from currency
            try {
                const res = await fetch(
                    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`,
                );
                if (!res.ok) {
                    throw new Error(`Failed to fetch currency data: ${res.status}`);
                }
                rates = await res.json();
            } catch (err) {
                console.error('Failed to fetch exchange rates:', err);
                return from.amount;
            }

            const rate = rates?.[fromCurrency]?.[toCurrency];
            return from.amount * (rate || 1);
        } catch (err) {
            console.error(err);
            return from.amount;
        }
    }

    public convertCurrencySync({ from, to }: CurrencyConversionArgs): number {
        try {
            const fromCurrency = from.currency.toLowerCase() as CurrencyCode;
            const toCurrency = to.currency.toLowerCase() as CurrencyCode;

            if (fromCurrency === toCurrency) return from.amount;

            const rates = this.nativeStorage.getItem<CurrencyRates>('currency-exchange-rates');
            if (!rates) return from.amount;

            // Direct rate: rates[from][to]
            const directRate = rates[fromCurrency]?.[toCurrency];
            if (directRate) return from.amount * directRate;

            // Inverse rate: if we have rates[to][from], use 1/rate
            const inverseRate = rates[toCurrency]?.[fromCurrency];
            if (inverseRate) return from.amount * (1 / inverseRate);

            return from.amount;
        } catch (err) {
            console.error(err);
            return from.amount;
        }
    }
}
