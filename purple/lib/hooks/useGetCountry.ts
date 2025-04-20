import { useState, useEffect } from 'react';
import DeviceCountry, { ResolveType } from 'react-native-device-country';

export default function useGetCountry() {
    const [countryCode, setCountryCode] = useState<ResolveType | null>(null);

    useEffect(() => {
        const fetchCountryCode = async () => {
            const code = await DeviceCountry.getCountryCode();
            setCountryCode(code);
        };

        fetchCountryCode();
    }, []);

    return { countryCode };
}
