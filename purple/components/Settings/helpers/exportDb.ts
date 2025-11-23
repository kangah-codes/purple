import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { Platform } from 'react-native';

export async function exportDatabase() {
    const source = FileSystem.documentDirectory + 'SQLite/purple.db';

    const info = await FileSystem.getInfoAsync(source);
    if (!info.exists) return console.log('❌ DB not found');

    if (Platform.OS === 'android') {
        const dir = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!dir.granted) return;

        const content = await FileSystem.readAsStringAsync(source, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileUri = await StorageAccessFramework.createFileAsync(
            dir.directoryUri,
            'purple-exported.db',
            'application/octet-stream',
        );

        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log('✅ Exported:', fileUri);
    } else {
        const dest = FileSystem.documentDirectory + 'purple-exported.db';
        await FileSystem.copyAsync({ from: source, to: dest });
        console.log('✅ Exported to Files app:', dest);
    }
}
