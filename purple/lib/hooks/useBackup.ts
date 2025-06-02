import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const DB_NAME = 'purple.db';
const SQLITE_PATH = `${FileSystem.documentDirectory}SQLite/`;

export function useBackup() {
    const dbPath = `${SQLITE_PATH}${DB_NAME}`;

    /**
     * Exports the database via the system share sheet
     */
    async function backupDatabase() {
        try {
            const tempBackupPath = `${FileSystem.cacheDirectory}${DB_NAME}`;

            const dbExists = await FileSystem.getInfoAsync(dbPath);
            if (!dbExists.exists) {
                throw new Error('Database file not found');
            }

            await FileSystem.copyAsync({
                from: dbPath,
                to: tempBackupPath,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(tempBackupPath, {
                    mimeType: 'application/octet-stream',
                    dialogTitle: 'Share your backup file',
                    UTI: 'public.item',
                });
            } else {
                throw new Error('Sharing not available on this device');
            }
        } catch (err: any) {
            console.error('Backup failed:', err.message);
            throw err;
        }
    }

    /**
     * Prompts user to select a backup file and restores it
     */
    async function restoreDatabase(): Promise<boolean> {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (res.type !== 'success') {
                return false;
            }

            const pickedFilePath = res.uri;
            const destPath = dbPath;

            const folderInfo = await FileSystem.getInfoAsync(SQLITE_PATH);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(SQLITE_PATH, { intermediates: true });
            }

            await FileSystem.copyAsync({
                from: pickedFilePath,
                to: destPath,
            });

            return true;
        } catch (err: any) {
            console.error('Restore failed:', err.message);
            return false;
        }
    }

    return {
        backupDatabase,
        restoreDatabase,
        dbPath,
    };
}
