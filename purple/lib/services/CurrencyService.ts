import Toast from 'react-native-toast-message';
import { currencies } from '../constants/currencies';
import { NativeStorage } from '../utils/storage';
import { usePreferencesStore } from '@/components/Settings/state';

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
            let rates = this.nativeStorage.getItem<CurrencyRates>('currency-exchange-rates');

            if (!rates || !rates[from.currency] || !rates[from.currency]![to.currency]) {
                try {
                    const res = await fetch(
                        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.currency.toLowerCase()}.json`,
                    );
                    if (!res.ok) {
                        throw new Error(`Failed to fetch currency data: ${res.status}`);
                    }
                    rates = await res.json();
                } catch (err) {
                    console.error('Failed to fetch exchange rates:', err);
                    return from.amount;
                }
            }

            const rate = rates![from.currency]![to.currency];
            return from.amount * (rate || 1);
        } catch (err) {
            console.error(err);
            return from.amount;
        }
    }

    public convertCurrencySync({ from, to }: CurrencyConversionArgs): number {
        try {
            const rates = this.nativeStorage.getItem<CurrencyRates>('currency-exchange-rates');
            if (!rates || !rates[from.currency] || !rates[from.currency]![to.currency]) {
                // throw new Error(`Exchange rate from ${from.currency} to ${to.currency} not found.`);
                // alert user instead and default to 1:1 conversion
                // Toast.show({
                //     type: 'error',
                //     props: {
                //         text1: 'Exchange rate not found',
                //         text2: `Couldn't find exchange rate from ${from.currency.toUpperCase()} to ${to.currency.toUpperCase()}. Defaulting to 1:1 conversion.`,
                //     },
                // });
                return from.amount;
            }

            const rate = rates[from.currency]![to.currency];
            const converted = from.amount * rate;

            return converted;
        } catch (err) {
            console.error(err);
            return from.amount;
        }
    }
}
