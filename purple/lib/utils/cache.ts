import { NativeStorage } from './storage';

interface CacheData<T> {
    items: { key: string; value: T }[];
    maxItems: number;
}

export class LRUCache<T> {
    private readonly maxItems: number;
    private readonly cacheKey: string;
    private cache: Map<string, T>;
    private readonly storage: NativeStorage;

    // Structure to store in NativeStorage
    constructor(cacheKey: string, maxItems: number = 50) {
        this.cacheKey = `lru_cache_${cacheKey}`;
        this.maxItems = maxItems;
        this.cache = new Map();
        this.storage = NativeStorage.getInstance();

        // Load existing cache from storage
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const data = this.storage.getItem<CacheData<T>>(this.cacheKey);
            if (data) {
                // Initialize cache with stored items
                this.cache = new Map(data.items.map((item) => [item.key, item.value]));

                // If maxItems has changed, trim the cache
                while (this.cache.size > this.maxItems) {
                    const firstKey = this.cache.keys().next().value;
                    if (firstKey) this.cache.delete(firstKey);
                }
            }
        } catch (error) {
            console.error('Error loading LRU cache from storage', error);
            this.cache = new Map();
        }
    }

    private saveToStorage(): void {
        try {
            const items = Array.from(this.cache.entries()).map(([key, value]) => ({
                key,
                value,
            }));

            const data: CacheData<T> = {
                items,
                maxItems: this.maxItems,
            };

            this.storage.setItem(this.cacheKey, data);
        } catch (error) {
            console.error('Error saving LRU cache to storage', error);
        }
    }

    get(key: string): T | undefined {
        // If key doesn't exist, return undefined
        if (!this.cache.has(key)) {
            return undefined;
        }

        // Get the value
        const value = this.cache.get(key)!;

        // Remove and re-add to put it at the end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, value);

        // Save updated order to storage
        this.saveToStorage();

        return value;
    }

    set(key: string, value: T): void {
        // If key exists, remove it first
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // If cache is full, remove the least recently used item (first item)
        else if (this.cache.size >= this.maxItems) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        // Add new item
        this.cache.set(key, value);

        // Save to storage
        this.saveToStorage();
    }

    delete(key: string): boolean {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.saveToStorage();
        }
        return deleted;
    }

    clear(): void {
        this.cache.clear();
        this.saveToStorage();
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    size(): number {
        return this.cache.size;
    }

    getMaxItems(): number {
        return this.maxItems;
    }

    getAllItems(): [string, T][] {
        return Array.from(this.cache.entries());
    }
}
