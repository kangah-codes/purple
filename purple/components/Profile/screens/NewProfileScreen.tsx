import Avatar from '@/components/Shared/atoms/Avatar';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import useHasOnboarded from '@/lib/db/db';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Button, StatusBar as RNStatusBar } from 'react-native';
import ProfilePages from '../molecules/ProfilePages';
import pkg from '@/package.json';

export default function NewProfileScreen() {
    const { setHasOnboarded } = useHasOnboarded();

    return (
        <SafeAreaView className='bg-white relative h-full'>
            <ExpoStatusBar style='dark' />
            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
                className='bg-white space-y-5 flex-1 flex flex-col'
            >
                <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                    <View className='flex flex-col'>
                        <Text style={{ fontFamily: 'Suprapower' }} className='text-lg'>
                            My Profile
                        </Text>
                    </View>
                </View>
                <View className='w-full'>
                    <View className='flex items-center justify-center space-y-5'>
                        <Avatar colour='purple' content='JA' size='xl' />

                        <View className='flex flex-col items-center'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-2xl text-black'
                            >
                                Joshua Akangah
                            </Text>
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-sm text-black tracking-tighter'
                            >
                                akangah89@gmail.com
                            </Text>
                        </View>
                    </View>
                </View>
                <View className='mt-5'>
                    <ProfilePages />
                </View>
                <View className='flex flex-row justify-center'>
                    <Text
                        style={{ fontFamily: 'InterMedium' }}
                        className='text-sm text-gray-600 tracking-tight'
                    >
                        Purple v{pkg.version}
                    </Text>
                </View>
                <Button
                    title='RESET'
                    onPress={() => {
                        setHasOnboarded(false).then(() => alert('Onboarding reset'));
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
