import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { Platform } from 'react-native';
import { type SQLiteDatabase } from 'expo-sqlite';

export async function exportDatabase(db: SQLiteDatabase) {
    try {
        // Ensure all pending transactions are committed
        await db.execAsync('PRAGMA wal_checkpoint(FULL)');

        const source = FileSystem.documentDirectory + 'SQLite/purple.db';
        const tempExport = FileSystem.documentDirectory + 'tmp_export.db';

        const info = await FileSystem.getInfoAsync(source);
        if (!info.exists) {
            console.log('❌ DB not found');
            return { success: false, error: 'Database file not found' };
        }

        // Create a temporary copy to avoid issues with the active database
        await safeDelete(tempExport);
        await FileSystem.copyAsync({ from: source, to: tempExport });

        if (Platform.OS === 'android') {
            const dir = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!dir.granted) {
                await safeDelete(tempExport);
                return { success: false, error: 'Permission denied' };
            }

            const content = await FileSystem.readAsStringAsync(tempExport, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const timestamp = new Date().toISOString().split('T')[0];
            const fileUri = await StorageAccessFramework.createFileAsync(
                dir.directoryUri,
                `purple-export-${timestamp}.db`,
                'application/octet-stream',
            );

            await FileSystem.writeAsStringAsync(fileUri, content, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await safeDelete(tempExport);
            console.log('✅ Exported:', fileUri);
            return { success: true, path: fileUri };
        } else {
            const timestamp = new Date().toISOString().split('T')[0];
            const dest = FileSystem.documentDirectory + `purple-export-${timestamp}.db`;

            await safeDelete(dest);
            await FileSystem.copyAsync({ from: tempExport, to: dest });
            await safeDelete(tempExport);

            console.log('✅ Exported to Files app:', dest);
            return { success: true, path: dest };
        }
    } catch (err) {
        console.error('Export failed:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

async function safeDelete(path: string) {
    try {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) await FileSystem.deleteAsync(path);
    } catch {
        console.warn('Delete failed for:', path);
    }
}
