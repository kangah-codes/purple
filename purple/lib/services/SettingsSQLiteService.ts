import { UserPreferences } from '@/components/Settings/schema';
import * as SQLite from 'expo-sqlite';
import { TRANSACTION_CATEGORY } from '../constants/transactionTypes';

export class SettingsSQLiteService {
    protected db: SQLite.SQLiteDatabase;

    constructor(protected sqlite: SQLite.SQLiteDatabase) {
        this.db = sqlite;
    }

    async ensureDefaults(preferences: Pick<UserPreferences, 'currency' | 'theme'>): Promise<void> {
        await this.db.withTransactionAsync(async () => {
            await Promise.all([
                this.db.runAsync(
                    `INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', ?)`,
                    [preferences.currency || 'GHS'],
                ),
                this.db.runAsync(
                    `INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', ?)`,
                    [preferences.theme || 'light'],
                ),
                ...TRANSACTION_CATEGORY.map((type) =>
                    this.db.runAsync(
                        `INSERT OR IGNORE INTO transaction_types (emoji, category, is_custom) VALUES (?, ?, 0)`,
                        [type.emoji, type.category],
                    ),
                ),
            ]);
        });
    }

    async get<K extends keyof UserPreferences>(key: K): Promise<UserPreferences[K] | null> {
        const result = await this.db.getFirstAsync<{ value: string }>(
            `SELECT value from settings WHERE key = ?`,
            [key],
        );

        if (!result) return null;
        const rawValue = result.value;

        switch (key) {
            case 'theme':
            case 'currency':
                return rawValue as UserPreferences[K];
            default:
                try {
                    return JSON.parse(rawValue) as UserPreferences[K];
                } catch (e) {
                    console.error(`Error parsing settings JSON with key ${key}`, e);
                    return null;
                }
        }
    }

    async set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): Promise<void> {
        let serialisedValue: string;

        if (typeof value === 'object') {
            serialisedValue = JSON.stringify(value);
        } else {
            serialisedValue = String(value);
        }

        await this.db.runAsync(
            `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
            [key, serialisedValue],
        );
    }

    async listTransactionTypes(): Promise<UserPreferences['customTransactionTypes']> {
        const result = await this.db.getAllAsync<UserPreferences['customTransactionTypes'][number]>(
            `SELECT (emoji, category, is_custom) FROM transaction_types`,
            [],
        );

        return [...TRANSACTION_CATEGORY, ...result] as unknown as Promise<
            UserPreferences['customTransactionTypes']
        >;
    }

    async updateTransactionTypes(
        custom: UserPreferences['customTransactionTypes'][number],
    ): Promise<void> {
        await this.db.runAsync(
            `INSERT INTO transaction_types (emoji, category, is_custom)
              VALUES (?, ?, 1)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, is_custom=1`,
            [custom.emoji, custom.category],
        );
    }
}
