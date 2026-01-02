import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { CLEAR_ORDER, INSERT_ORDER } from './tables';
import { clearTable, importTableData } from './dbHelpers';
import { TRANSACTION_CATEGORY } from '@/lib/constants/transactionTypes';
import { usePreferencesStore } from '@/components/Settings/state';

export async function importDatabase(db: SQLiteDatabase) {
    try {
        const picked = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (!picked.assets?.[0]?.uri) {
            return { success: false, error: 'No file selected' };
        }

        const tempPath = FileSystem.documentDirectory + 'tmp_import.db';

        // Copy file into readable space
        await safeDelete(tempPath);
        await FileSystem.copyAsync({
            from: picked.assets[0].uri,
            to: tempPath,
        });

        const importDb = openDatabaseSync(tempPath);

        const tables = await importDb.getAllAsync<{ name: string }>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        );
        const tableNames = tables.map((t) => t.name);

        await db.withTransactionAsync(async () => {
            await db.runAsync('PRAGMA foreign_keys = OFF');

            // Clear existing tables
            for (const table of [
                ...CLEAR_ORDER,
                // @ts-expect-error ignore
                ...tableNames.filter((t) => !CLEAR_ORDER.includes(t)),
            ]) {
                if (tableNames.includes(table)) {
                    await clearTable(db, table);
                }
            }

            // Insert imported data
            for (const table of [
                ...INSERT_ORDER,
                // @ts-expect-error ignore
                ...tableNames.filter((t) => !INSERT_ORDER.includes(t)),
            ]) {
                if (tableNames.includes(table)) {
                    await importTableData(importDb, db, table);
                }

                if (table === 'accounts') {
                    await db.runAsync('UPDATE accounts SET balance = 0');
                }
            }

            await db.runAsync('PRAGMA foreign_keys = ON');
        });

        // Merge predefined transaction types with imported ones
        await mergeTransactionTypes(db);

        // Update the preferences store with the merged transaction types
        await refreshTransactionTypesInStore(db);

        await importDb.closeAsync();
        await safeDelete(tempPath);

        return { success: true };
    } catch (err) {
        console.error('[importDatabase] Import DB failed', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

/**
 * Merges predefined transaction types from TRANSACTION_CATEGORY with imported ones.
 * Predefined types are inserted with is_custom = 0.
 * Uses category as the primary identifier - if a category already exists, it's not overwritten.
 * If an emoji conflict occurs, it's silently ignored (per table schema).
 */
async function mergeTransactionTypes(db: SQLiteDatabase) {
    for (const type of TRANSACTION_CATEGORY) {
        // Check if this category already exists in the database
        const existing = await db.getFirstAsync<{ category: string }>(
            `SELECT category FROM transaction_types WHERE category = ?`,
            [type.category],
        );

        // Only insert if the category doesn't already exist
        if (!existing) {
            // The table has UNIQUE ON CONFLICT IGNORE for both category and emoji,
            // so if there's an emoji conflict, it will be silently ignored
            await db.runAsync(
                `INSERT OR IGNORE INTO transaction_types (emoji, category, is_custom)
                 VALUES (?, ?, 0)`,
                [type.emoji, type.category],
            );
        }
    }
}

/**
 * Refreshes the transaction types in the preferences store after import.
 */
async function refreshTransactionTypesInStore(db: SQLiteDatabase) {
    const result = await db.getAllAsync<{ emoji: string; category: string; is_custom: number }>(
        `SELECT emoji, category, is_custom FROM transaction_types`,
        [],
    );

    // Combine predefined types with custom ones from the database
    // The predefined ones come first, then any additional custom ones
    const predefinedCategories = new Set(TRANSACTION_CATEGORY.map((t) => t.category));
    const customTypes = result.filter((t) => !predefinedCategories.has(t.category));

    const allTypes = [
        ...TRANSACTION_CATEGORY,
        ...customTypes.map((t) => ({ emoji: t.emoji, category: t.category })),
    ];

    usePreferencesStore.getState().setPreferences({
        customTransactionTypes: allTypes,
    });
}

async function safeDelete(path: string) {
    try {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) await FileSystem.deleteAsync(path);
    } catch (err) {
        console.error('[safeDelete] Delete failed', err);
    }
}
