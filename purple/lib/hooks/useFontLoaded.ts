import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export const useFontsLoaded = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const checkFonts = () => {
            const required = ['SatoshiBlack', 'SatoshiBold', 'SatoshiMedium', 'SatoshiRegular'];

            const allLoaded = required.every((font) => Font.isLoaded(font));
            setFontsLoaded(allLoaded);
        };

        checkFonts();
    }, [fontsLoaded]);

    return fontsLoaded;
};
