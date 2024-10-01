import AsyncStorage from '@react-native-async-storage/async-storage';

type Listener = () => void;

class SimpleEventEmitter {
    private listeners: Map<string, Set<Listener>> = new Map();

    on(event: string, listener: Listener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    off(event: string, listener: Listener): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
        }
    }

    emit(event: string): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((listener) => listener());
        }
    }
}

export class NativeStorage {
    private static instance: NativeStorage;
    private keys: Set<string> = new Set();
    private eventEmitter: SimpleEventEmitter;

    private constructor() {
        this.eventEmitter = new SimpleEventEmitter();
        this.keys = new Set();
    }

    public static getInstance(): NativeStorage {
        if (!NativeStorage.instance) {
            NativeStorage.instance = new NativeStorage();
        }
        return NativeStorage.instance;
    }

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
            this.keys.add(key);
        } catch (error) {
            console.error('Error setting item in AsyncStorage', error);
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
            this.keys.delete(key);
        } catch (error) {
            console.error('Error removing item from AsyncStorage', error);
        }
    }

    async multiRemove(keys: string[]): Promise<void> {
        try {
            await AsyncStorage.multiRemove(keys);
            keys.forEach((key) => this.keys.delete(key));
        } catch (error) {
            console.error('Error removing multiple items from AsyncStorage', error);
        }
    }

    async clear(): Promise<void> {
        try {
            const allKeys = Array.from(this.keys);
            if (allKeys.length > 0) {
                await this.multiRemove(allKeys);
            }
            // Clear AsyncStorage and the local keys set
            this.keys.clear();
            this.eventEmitter.emit('clearCompleted');
        } catch (error) {
            console.error('Error clearing AsyncStorage', error);
        }
    }

    async hasItem(key: string): Promise<boolean> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys.includes(key);
        } catch (error) {
            console.error('Error checking if key exists in AsyncStorage', error);
            return false;
        }
    }

    // Helper method to get all stored keys
    getAllKeys(): string[] {
        return Array.from(this.keys);
    }

    onClearCompleted(listener: () => void): void {
        this.eventEmitter.on('clearCompleted', listener);
    }

    offClearCompleted(listener: () => void): void {
        this.eventEmitter.off('clearCompleted', listener);
    }
}

// Create an instance of NativeStorage
export const nativeStorage = NativeStorage.getInstance();
