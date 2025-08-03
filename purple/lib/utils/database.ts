import * as FileSystem from 'expo-file-system';

export async function findExistingDatabase() {
    try {
        // Define possible database locations
        const dbName = 'purple.db';
        const newDbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
        const oldDbPath = `${FileSystem.documentDirectory}${dbName}`;

        // Check new location first
        const newExists = await FileSystem.getInfoAsync(newDbPath);
        if (newExists.exists) {
            return { found: true, path: newDbPath };
        }

        // Check old location
        const oldExists = await FileSystem.getInfoAsync(oldDbPath);
        if (oldExists.exists) {
            // Create SQLite directory if it doesn't exist
            const dbDir = `${FileSystem.documentDirectory}SQLite`;
            const dirInfo = await FileSystem.getInfoAsync(dbDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dbDir);
            }

            // Move database to new location
            await FileSystem.moveAsync({
                from: oldDbPath,
                to: newDbPath,
            });

            return { found: true, path: newDbPath };
        }

        return { found: false, path: newDbPath };
    } catch (error) {
        console.error('Error checking database:', error);
        return { found: false, error };
    }
}
