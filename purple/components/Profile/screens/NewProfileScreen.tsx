import Avatar from '@/components/Shared/atoms/Avatar';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import useHasOnboarded from '@/lib/db/db';
import pkg from '@/package.json';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Button } from 'react-native';
import ProfilePages from '../molecules/ProfilePages';
import Toast from 'react-native-toast-message';

export default function NewProfileScreen() {
    const { setHasOnboarded } = useHasOnboarded();
    const showToast = () => {
        Toast.show({
            type: 'warning',
            props: {
                text1: 'USER',
                text2: 'account creation failed!',
            },
        });
    };

    return (
        <SafeAreaView className='bg-white relative h-full'>
            <ExpoStatusBar style='dark' />
            <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                    My Profile
                </Text>
            </View>
            <View className='flex items-center justify-center space-y-5 mt-5'>
                <Avatar colour='purple' content='JA' size='xl' />

                <View className='flex flex-col items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-2xl text-black'>
                        Joshua Akangah
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-sm text-black tracking-tighter'
                    >
                        akangah89@gmail.com
                    </Text>
                </View>
            </View>
            <View className='mt-5'>
                <ProfilePages />
            </View>
            <View className='flex flex-row justify-center'>
                <Text
                    style={GLOBAL_STYLESHEET.interMedium}
                    className='text-sm text-gray-600 tracking-tight'
                >
                    Purple v{pkg.version}
                </Text>
            </View>
            <Button
                title='RESET'
                onPress={() => {
                    setHasOnboarded(false).then(() =>
                        Toast.show({
                            type: 'info',
                            props: {
                                text1: 'Cache reset',
                                text2: 'The entire app cache has been cleared!',
                            },
                        }),
                    );
                }}
            />
            <Button title='Show Toast' onPress={showToast} />
        </SafeAreaView>
    );
}
