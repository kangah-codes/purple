import { SQLiteDatabase } from 'expo-sqlite';

export async function tableExists(db: SQLiteDatabase, tableName: string) {
    const tables = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName],
    );
    return tables.length > 0;
}

export async function countRows(db: SQLiteDatabase, tableName: string) {
    const row = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${tableName}`,
    );
    return row?.count ?? 0;
}

export async function clearTable(db: SQLiteDatabase, tableName: string) {
    const before = await countRows(db, tableName);
    console.log(`📊 ${tableName} has ${before} rows before clear`);

    await db.runAsync(`DELETE FROM ${tableName}`);

    const after = await countRows(db, tableName);
    console.log(`🗑️ Cleared ${tableName} (${after} rows remain)`);

    if (after !== 0) {
        console.warn(`⚠️ ${tableName} still has data after deletion`);
    }
}

export async function importTableData(
    importDb: SQLiteDatabase,
    targetDb: SQLiteDatabase,
    tableName: string,
) {
    const rows = await importDb.getAllAsync<{ [key: string]: any }>(`SELECT * FROM ${tableName}`);
    if (rows.length === 0) {
        console.log(`📭 ${tableName} empty, skipping`);
        return;
    }

    const columns = await targetDb.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    const colNames = columns.map((c) => c.name);
    const placeholders = colNames.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${colNames.join(', ')}) VALUES (${placeholders})`;

    for (const row of rows) {
        await targetDb.runAsync(
            sql,
            colNames.map((c) => row[c]),
        );
    }

    console.log(`✅ Imported ${rows.length} rows into ${tableName}`);
}
