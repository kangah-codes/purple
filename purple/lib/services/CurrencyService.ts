import { currencies } from '../constants/currencies';

type CurrencyCode = (typeof currencies)[number]['code'];
export type CurrencyRates = {
    date: string;
    currency: Record<CurrencyCode, Record<CurrencyCode, number>>;
};

export default class CurrencyService {
    constructor() {}

    public async fetchExchangeRates(code: CurrencyCode): Promise<void> {
        const res = await fetch(
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code.toLowerCase()}.json`,
        );
        if (!res.ok) {
            throw new Error(`Failed to fetch currency data: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
    }

    public convertCurrency(): void {}
}
