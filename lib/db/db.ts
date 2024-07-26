import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useHasOnboarded = () => {
    const [hasOnboarded, _setHasOnboarded] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hasOnboardedValue = await AsyncStorage.getItem('hasOnboarded');
                if (hasOnboardedValue !== null) {
                    setHasOnboarded(JSON.parse(hasOnboardedValue));
                } else {
                    _setHasOnboarded(false);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching hasOnboarded:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const setHasOnboardedTrue = async () => {
        try {
            await AsyncStorage.setItem('hasOnboarded', JSON.stringify(true));
            setHasOnboarded(true);
        } catch (error) {
            console.error('Error setting hasOnboarded to true:', error);
        }
    };

    const setHasOnboarded = async (value: boolean) => {
        try {
            await AsyncStorage.setItem('hasOnboarded', JSON.stringify(value));
            _setHasOnboarded(value);
        } catch (error) {
            console.error('Error setting hasOnboarded:', error);
        }
    };

    return { hasOnboarded, loading, setHasOnboardedTrue, setHasOnboarded };
};

export default useHasOnboarded;
