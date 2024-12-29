import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

export class NativeStorage {
    private static instance: NativeStorage;
    private keys: Set<string> = new Set();
    private storage: MMKV;

    private constructor() {
        this.keys = new Set();
        this.storage = new MMKV();

        // Initialize keys set with existing keys
        const allKeys = this.storage.getAllKeys();
        allKeys.forEach((key) => this.keys.add(key));
    }

    public static getInstance(): NativeStorage {
        if (!NativeStorage.instance) {
            NativeStorage.instance = new NativeStorage();
        }
        return NativeStorage.instance;
    }

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const value = this.storage.getString(key);
            if (value === undefined || value === null) {
                return null;
            }
            return JSON.parse(value) as T;
        } catch (error) {
            console.error('Error getting item from MMKV', error);
            return null;
        }
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        try {
            this.storage.set(key, JSON.stringify(value));
            this.keys.add(key);
        } catch (error) {
            console.error('Error setting item in MMKV', error);
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            this.storage.delete(key);
            this.keys.delete(key);
        } catch (error) {
            console.error('Error removing item from MMKV', error);
        }
    }

    async multiRemove(keys: string[]): Promise<void> {
        try {
            keys.forEach((key) => {
                this.storage.delete(key);
                this.keys.delete(key);
            });
        } catch (error) {
            console.error('Error removing multiple items from MMKV', error);
        }
    }

    async clear(): Promise<void> {
        try {
            this.storage.clearAll();
            this.keys.clear();
        } catch (error) {
            console.error('Error clearing MMKV', error);
        }
    }

    async hasItem(key: string): Promise<boolean> {
        try {
            return this.storage.contains(key);
        } catch (error) {
            console.error('Error checking if key exists in MMKV', error);
            return false;
        }
    }

    getAllKeys(): string[] {
        return Array.from(this.keys);
    }
}

// Create an instance of NativeStorage
export const nativeStorage = NativeStorage.getInstance();
