import * as SecureStore from 'expo-secure-store';

export async function getSecureValue<T = any>(key: string): Promise<T | null> {
    try {
        const data = await SecureStore.getItemAsync(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (err) {
        console.error(`Error retrieving ${key}:`, err);
        return null;
    }
}

export async function setSecureValue(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
}

export async function deleteSecureValue(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
}
