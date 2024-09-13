import AsyncStorage from '@react-native-async-storage/async-storage';

export class NativeStorage {
    constructor() {}

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value === null) {
                return null;
            }
            return JSON.parse(value) as T;
        } catch (error) {
            console.error('Error getting item from AsyncStorage', error);
            return null;
        }
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in AsyncStorage', error);
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item from AsyncStorage', error);
        }
    }

    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing AsyncStorage', error);
        }
    }

    // Helper method to check if a key exists
    async hasItem(key: string): Promise<boolean> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys.includes(key);
        } catch (error) {
            console.error('Error checking if key exists in AsyncStorage', error);
            return false;
        }
    }
}

// Create an instance of NativeStorage
export const nativeStorage = new NativeStorage();
