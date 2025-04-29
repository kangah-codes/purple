import { satoshiFont } from '../constants/fonts';
import { currencies } from '../constants/currencies';
import { countryCodes } from '../constants/countries';
import { ACCOUNT_TYPES } from '../constants/accountTypes';

type AppConfig = {
    constants: {
        accountTypes: typeof ACCOUNT_TYPES;
        currencies: typeof currencies;
        countryCodes: typeof countryCodes;
        fonts: typeof satoshiFont;
    };
};

const appConfig: AppConfig = {
    constants: {
        accountTypes: ACCOUNT_TYPES,
        currencies,
        countryCodes,
        fonts: satoshiFont,
    },
} as const;

export default appConfig;
