import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export async function exportDatabase() {
    const sourcePath = FileSystem.documentDirectory + 'SQLite/purple.db';

    try {
        const exists = await FileSystem.getInfoAsync(sourcePath);
        if (!exists.exists) {
            console.log('❌ DB not found at', sourcePath);
            return;
        }

        if (Platform.OS === 'android') {
            // Request directory permissions
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (!permissions.granted) {
                console.log('❌ Directory access permission denied');
                return;
            }

            // Read the database file
            const fileContent = await FileSystem.readAsStringAsync(sourcePath, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Create the file in the selected directory
            const fileUri = await StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                'purple-exported.db',
                'application/octet-stream',
            );

            // Write the content to the new file
            await FileSystem.writeAsStringAsync(fileUri, fileContent, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('✅ DB exported to selected location:', fileUri);
        } else if (Platform.OS === 'ios') {
            // For iOS, copy to Documents directory (accessible via Files app)
            const destPath = FileSystem.documentDirectory + 'purple-exported.db';
            await FileSystem.copyAsync({
                from: sourcePath,
                to: destPath,
            });

            console.log('✅ DB exported to Documents folder:', destPath);
            console.log('Access via Files app > On My iPhone/iPad > Your App Name');
        }
    } catch (err) {
        console.error('Error exporting DB:', err);
    }
}

export async function importDatabase() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            console.log('❌ File selection cancelled');
            return false;
        }

        const selectedFile = result.assets?.[0];
        if (!selectedFile?.uri) {
            console.log('❌ No file selected');
            return false;
        }

        const selectedFileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const dbDir = `${FileSystem.documentDirectory}SQLite`;
        const dbPath = `${dbDir}/purple.db`;

        const dirInfo = await FileSystem.getInfoAsync(dbDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
        }

        // IMPORTANT: Write as base64 to avoid permission and corruption issues
        await FileSystem.writeAsStringAsync(dbPath, selectedFileBase64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log('✅ Database imported successfully to:', dbPath);
        return true;
    } catch (err) {
        console.error('Error importing DB:', err);
        return false;
    }
}
