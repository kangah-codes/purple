// import * as FileSystem from 'expo-file-system';
// import { StorageAccessFramework } from 'expo-file-system';
// import { Platform } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// import type { SQLiteDatabase } from 'expo-sqlite';

// async function importTableData(
//     importDb: SQLiteDatabase,
//     targetDb: SQLiteDatabase,
//     tableName: string,
// ) {
//     try {
//         // Get all data from the imported table
//         const rows = await importDb.getAllAsync(`SELECT * FROM ${tableName}`);

//         if (rows.length === 0) {
//             console.log(`📭 Table ${tableName} is empty, skipping`);
//             return;
//         }

//         // Check current row count before insertion
//         const beforeInsertCount = await targetDb.getFirstAsync<{ count: number }>(
//             `SELECT COUNT(*) as count FROM ${tableName}`,
//         );
//         console.log(
//             `📊 Target table ${tableName} has ${beforeInsertCount?.count || 0} rows before import`,
//         );

//         // Get column names for the table from the target database
//         const columns = await targetDb.getAllAsync<{ name: string }>(
//             `PRAGMA table_info(${tableName})`,
//         );
//         const columnNames = columns.map((col) => col.name);

//         // Prepare insert statement
//         const placeholders = columnNames.map(() => '?').join(', ');
//         const insertSql = `INSERT INTO ${tableName} (${columnNames.join(
//             ', ',
//         )}) VALUES (${placeholders})`;

//         // Insert each row
//         let insertedCount = 0;
//         for (const row of rows) {
//             const values = columnNames.map((col) => row[col]);
//             await targetDb.runAsync(insertSql, values);
//             insertedCount++;
//         }

//         // Verify final count
//         const afterInsertCount = await targetDb.getFirstAsync<{ count: number }>(
//             `SELECT COUNT(*) as count FROM ${tableName}`,
//         );

//         console.log(
//             `✅ Imported ${insertedCount} rows to ${tableName} (total rows now: ${
//                 afterInsertCount?.count || 0
//             })`,
//         );

//         // Log a warning if the counts don't match expectations
//         const expectedCount = (beforeInsertCount?.count || 0) + insertedCount;
//         if (afterInsertCount?.count !== expectedCount) {
//             console.warn(
//                 `⚠️ Count mismatch in ${tableName}: expected ${expectedCount}, got ${afterInsertCount?.count}`,
//             );
//         }
//     } catch (e) {
//         console.error(`❌ Failed to import table ${tableName}:`, e);
//         throw new Error(
//             `Failed to import table ${tableName}: ${e instanceof Error ? e.message : String(e)}`,
//         );
//     }
// }

// export async function exportDatabase() {
//     const sourcePath = FileSystem.documentDirectory + 'SQLite/purple.db';

//     try {
//         const exists = await FileSystem.getInfoAsync(sourcePath);
//         if (!exists.exists) {
//             console.log('❌ DB not found at', sourcePath);
//             return;
//         }

//         if (Platform.OS === 'android') {
//             // Request directory permissions
//             const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

//             if (!permissions.granted) {
//                 console.log('❌ Directory access permission denied');
//                 return;
//             }

//             // Read the database file
//             const fileContent = await FileSystem.readAsStringAsync(sourcePath, {
//                 encoding: FileSystem.EncodingType.Base64,
//             });

//             // Create the file in the selected directory
//             const fileUri = await StorageAccessFramework.createFileAsync(
//                 permissions.directoryUri,
//                 'purple-exported.db',
//                 'application/octet-stream',
//             );

//             // Write the content to the new file
//             await FileSystem.writeAsStringAsync(fileUri, fileContent, {
//                 encoding: FileSystem.EncodingType.Base64,
//             });

//             console.log('✅ DB exported to selected location:', fileUri);
//         } else if (Platform.OS === 'ios') {
//             // For iOS, copy to Documents directory (accessible via Files app)
//             const destPath = FileSystem.documentDirectory + 'purple-exported.db';
//             await FileSystem.copyAsync({
//                 from: sourcePath,
//                 to: destPath,
//             });

//             console.log('✅ DB exported to Documents folder:', destPath);
//             console.log('Access via Files app > On My iPhone/iPad > Your App Name');
//         }
//     } catch (err) {
//         console.error('Error exporting DB:', err);
//     }
// }

// export async function importDatabase(
//     db: SQLiteDatabase,
// ): Promise<{ success: boolean; error?: string }> {
//     try {
//         const result = await DocumentPicker.getDocumentAsync({
//             type: '*/*',
//             copyToCacheDirectory: true,
//         });

//         if (result.canceled) {
//             console.log('❌ File selection cancelled');
//             return { success: false, error: 'File selection cancelled' };
//         }

//         const selectedFile = result.assets?.[0];
//         if (!selectedFile?.uri) {
//             console.log('❌ No file selected');
//             return { success: false, error: 'No file selected' };
//         }

//         // Copy the selected database to a temporary location we can read
//         const tempDbPath = `${FileSystem.documentDirectory}temp_import.db`;

//         try {
//             // Clean up any existing temp file
//             if ((await FileSystem.getInfoAsync(tempDbPath)).exists) {
//                 await FileSystem.deleteAsync(tempDbPath);
//             }

//             await FileSystem.copyAsync({
//                 from: selectedFile.uri,
//                 to: tempDbPath,
//             });

//             console.log('✅ Copied import file to temp location');

//             // Open the temporary database for reading
//             const { openDatabaseAsync } = await import('expo-sqlite');
//             const importDb = await openDatabaseAsync(tempDbPath);

//             // Get all table names from the imported database
//             const tables = await importDb.getAllAsync<{ name: string }>(
//                 "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
//             );

//             console.log(
//                 '📋 Found tables:',
//                 tables.map((t) => t.name),
//             );

//             // Start transaction on current database
//             await db.withTransactionAsync(async () => {
//                 // Disable foreign key constraints temporarily
//                 await db.runAsync('PRAGMA foreign_keys = OFF');

//                 // Clear existing data from current database tables in reverse dependency order
//                 // Common order: transactions, recurring_transactions, accounts, users, settings
//                 const clearOrder = [
//                     'transactions',
//                     'recurring_transactions',
//                     'accounts',
//                     'users',
//                     'settings',
//                 ];

//                 for (const tableName of clearOrder) {
//                     const tableExists = tables.find((t) => t.name === tableName);
//                     if (tableExists) {
//                         try {
//                             // Count rows before deletion
//                             const beforeCount = await db.getFirstAsync<{ count: number }>(
//                                 `SELECT COUNT(*) as count FROM ${tableName}`,
//                             );
//                             console.log(
//                                 `📊 Table ${tableName} has ${
//                                     beforeCount?.count || 0
//                                 } rows before clear`,
//                             );

//                             await db.runAsync(`DELETE FROM ${tableName}`);

//                             // Verify deletion worked
//                             const afterCount = await db.getFirstAsync<{ count: number }>(
//                                 `SELECT COUNT(*) as count FROM ${tableName}`,
//                             );
//                             console.log(
//                                 `🗑️ Cleared table: ${tableName} (${
//                                     afterCount?.count || 0
//                                 } rows remaining)`,
//                             );

//                             if (afterCount && afterCount.count > 0) {
//                                 console.warn(
//                                     `⚠️ Warning: ${tableName} still has ${afterCount.count} rows after deletion!`,
//                                 );
//                             }
//                         } catch (e) {
//                             console.warn(`⚠️ Failed to clear table ${tableName}:`, e);
//                         }
//                     }
//                 }

//                 // Clear any remaining tables not in the specific order
//                 for (const table of tables) {
//                     if (!clearOrder.includes(table.name)) {
//                         try {
//                             const beforeCount = await db.getFirstAsync<{ count: number }>(
//                                 `SELECT COUNT(*) as count FROM ${table.name}`,
//                             );
//                             console.log(
//                                 `📊 Table ${table.name} has ${
//                                     beforeCount?.count || 0
//                                 } rows before clear`,
//                             );

//                             await db.runAsync(`DELETE FROM ${table.name}`);

//                             const afterCount = await db.getFirstAsync<{ count: number }>(
//                                 `SELECT COUNT(*) as count FROM ${table.name}`,
//                             );
//                             console.log(
//                                 `🗑️ Cleared table: ${table.name} (${
//                                     afterCount?.count || 0
//                                 } rows remaining)`,
//                             );
//                         } catch (e) {
//                             console.warn(`⚠️ Failed to clear table ${table.name}:`, e);
//                         }
//                     }
//                 }

//                 // Copy data from imported database to current database
//                 // Insert in dependency order: users, settings, accounts, recurring_transactions, transactions
//                 const insertOrder = [
//                     'users',
//                     'settings',
//                     'accounts',
//                     'recurring_transactions',
//                     'transactions',
//                 ];

//                 // Insert tables in specific order first
//                 for (const tableName of insertOrder) {
//                     const tableExists = tables.find((t) => t.name === tableName);
//                     if (tableExists) {
//                         await importTableData(importDb, db, tableName);

//                         // After importing accounts, reset their balances to 0
//                         // The database triggers will recalculate them when transactions are imported
//                         if (tableName === 'accounts') {
//                             console.log(
//                                 '🔄 Resetting account balances to 0 (triggers will recalculate)...',
//                             );
//                             await db.runAsync('UPDATE accounts SET balance = 0');
//                             console.log('✅ Account balances reset to 0');
//                         }
//                     }
//                 }

//                 // Insert any remaining tables not in the specific order
//                 for (const table of tables) {
//                     if (!insertOrder.includes(table.name)) {
//                         await importTableData(importDb, db, table.name);
//                     }
//                 }

//                 // Re-enable foreign key constraints
//                 await db.runAsync('PRAGMA foreign_keys = ON');
//             });

//             // Close and cleanup temporary database
//             await importDb.closeAsync();
//             await FileSystem.deleteAsync(tempDbPath);

//             console.log('✅ Database imported successfully');
//             return { success: true };
//         } catch (importError) {
//             // Cleanup temp file if it exists
//             try {
//                 if ((await FileSystem.getInfoAsync(tempDbPath)).exists) {
//                     await FileSystem.deleteAsync(tempDbPath);
//                 }
//             } catch (cleanupError) {
//                 console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
//             }
//             throw importError;
//         }
//     } catch (err) {
//         console.error('Error importing DB:', err);
//         return { success: false, error: err instanceof Error ? err.message : String(err) };
//     }
// }
