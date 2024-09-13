import { MMKV, Mode } from 'react-native-mmkv';

export class NativeStorage {
    private storage: MMKV;

    constructor(storage: MMKV) {
        this.storage = storage;
    }

    getItem<T>(key: string): T | null {
        const value = this.storage.getString(key);
        if (value === undefined) {
            return null;
        }
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    setItem<T>(key: string, value: T): void {
        this.storage.set(key, JSON.stringify(value));
    }

    removeItem(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clearAll();
    }

    // Helper method to check if a key exists
    hasItem(key: string): boolean {
        return this.storage.contains(key);
    }
}

// Create an instance of NativeStorage with the MMKV instance
export const nativeStorage = new NativeStorage(
    new MMKV({
        id: `purple`,
        encryptionKey: process.env.EXPO_PUBLIC_API_KEY,
        mode: Mode.MULTI_PROCESS,
    }),
);
