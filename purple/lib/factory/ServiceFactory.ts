import { SessionData } from '@/components/Auth/schema';
import * as SQLite from 'expo-sqlite';
import { APIService } from '../services/APIService';
import { AccountSQLiteService } from '../services/AccountSQLiteService';
import { DataService } from '../services/DataService';
import { PlanSQLiteService } from '../services/PlanSQLiteService';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';
import { nativeStorage } from '../utils/storage';

export class ServiceFactory {
    private static accountService: AccountSQLiteService | null = null;
    private static transactionService: TransactionSQLiteService | null = null;
    private static planService: PlanSQLiteService | null = null;
    private static apiServices: Map<string, APIService<any>> = new Map();
    private static isOfflineModeCache: boolean | null = null;
    private static lastOfflineModeCheck: number = 0;
    private static CACHE_DURATION = 1000; // Cache offline mode check for 1 second
    private static cachedDb: SQLite.SQLiteDatabase | null = null;

    static create<T>(
        endpoint: 'accounts' | 'transactions' | 'plans',
        db: SQLite.SQLiteDatabase,
        sessionData: SessionData | null,
    ): DataService<T> {
        // If the db instance changed (SQLiteProvider remounted with a new connection),
        // discard all cached SQLite services so they're recreated with the live connection.
        if (this.cachedDb !== null && this.cachedDb !== db) {
            this.accountService = null;
            this.transactionService = null;
            this.planService = null;
        }
        this.cachedDb = db;

        // Cache the offline mode check to avoid repeated synchronous storage reads
        const now = Date.now();
        if (
            this.isOfflineModeCache === null ||
            now - this.lastOfflineModeCheck > this.CACHE_DURATION
        ) {
            this.isOfflineModeCache = nativeStorage.getItem('isOfflineMode') === true;
            this.lastOfflineModeCheck = now;
        }

        if (this.isOfflineModeCache) {
            switch (endpoint) {
                case 'accounts':
                    if (!this.accountService) this.accountService = new AccountSQLiteService(db);
                    return this.accountService as unknown as DataService<T>;
                case 'transactions':
                    if (!this.transactionService)
                        this.transactionService = new TransactionSQLiteService(db);
                    return this.transactionService as unknown as DataService<T>;
                case 'plans':
                    if (!this.planService) this.planService = new PlanSQLiteService(db);
                    return this.planService as unknown as DataService<T>;
                default:
                    throw new Error(`No offline service implementation for ${endpoint}`);
            }
        }

        // Cache API service instances as well to avoid recreation
        const userId = sessionData?.userId ?? 'default';
        const cacheKey = `${endpoint}-${userId}`;

        if (!this.apiServices.has(cacheKey)) {
            this.apiServices.set(
                cacheKey,
                new APIService<T>(process.env.EXPO_PUBLIC_API_URL!, endpoint, sessionData!),
            );
        }

        return this.apiServices.get(cacheKey)!;
    }

    // Call this when offline mode changes or user logs out
    static clearCache(): void {
        this.isOfflineModeCache = null;
        this.lastOfflineModeCheck = 0;
        this.apiServices.clear();
        this.accountService = null;
        this.transactionService = null;
        this.planService = null;
        this.cachedDb = null;
    }
}
