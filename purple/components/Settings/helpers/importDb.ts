import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { CLEAR_ORDER, INSERT_ORDER } from './tables';
import { clearTable, importTableData } from './dbHelpers';

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

        await importDb.closeAsync();
        await safeDelete(tempPath);

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

async function safeDelete(path: string) {
    try {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) await FileSystem.deleteAsync(path);
    } catch {
        console.warn('Delete failed');
    }
}
