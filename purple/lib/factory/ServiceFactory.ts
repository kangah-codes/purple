import { SessionData } from '@/components/Auth/schema';
import { nativeStorage } from '../utils/storage';
import { APIService } from '../services/APIService';
import { DataService } from '../services/DataService';
import { GenericAPIResponse } from '@/@types/request';
import { AccountSQLiteService } from '../services/AccountSQLiteService';
import * as SQLite from 'expo-sqlite';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';
import { PlanSQLiteService } from '../services/PlanSQLiteService';

export class ServiceFactory {
    private static accountService: AccountSQLiteService | null = null;
    private static transactionService: TransactionSQLiteService | null = null;
    private static planService: PlanSQLiteService | null = null;

    static async create<T>(
        endpoint: 'accounts' | 'transactions' | 'plans',
        db: SQLite.SQLiteDatabase,
        sessionData?: SessionData,
    ): Promise<DataService<T>> {
        const isOffline = await nativeStorage.getItem('isOfflineMode');

        if (isOffline) {
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

        return new APIService<T>(process.env.EXPO_PUBLIC_API_URL!, endpoint, sessionData!);
    }
}
