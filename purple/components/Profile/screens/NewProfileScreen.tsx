import { useAuth } from '@/components/Auth/hooks';
import Avatar from '@/components/Shared/atoms/Avatar';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import pkg from '@/package.json';
import { Redirect } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Button, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import ProfilePages from '../molecules/ProfilePages';
import { nativeStorage } from '@/lib/utils/storage';

export default function NewProfileScreen() {
    const { destroySession, sessionData, hasOnboarded, setOnboarded, isLoading } = useAuth();
    const showToast = () => {
        Toast.show({
            type: 'error',
            props: {
                text1: 'USER',
                text2: 'account creation failed!',
            },
        });
    };

    // if (!sessionData) {
    //     return <Redirect href={'/onboarding/steps'} />;
    // }

    nativeStorage.onClearCompleted(() => {
        console.log('HELLO');
    });

    if (isLoading) {
        return null;
    }

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                    My Profile
                </Text>
            </View>
            <View className='flex items-center justify-center space-y-5 mt-5'>
                <Avatar
                    colour='purple'
                    // TODO: do something proper here
                    // @ts-ignore
                    content={sessionData?.user?.username?.at(0)?.toLocaleUpperCase()}
                    size='xl'
                />

                <View className='flex flex-col items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-2xl text-black'>
                        {sessionData?.user.username}
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-sm text-black tracking-tighter'
                    >
                        {sessionData?.user.email}
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
                    setOnboarded(false).then(() =>
                        destroySession().then(() => {
                            Toast.show({
                                type: 'info',
                                props: {
                                    text1: 'Cache reset',
                                    text2: 'The entire app cache has been cleared!',
                                },
                            });
                        }),
                    );
                }}
            />
            <Button
                title='Sign Out'
                onPress={() => {
                    destroySession().then(() => {
                        Toast.show({
                            type: 'info',
                            props: {
                                text1: 'Sign Out',
                                text2: 'Sign Out',
                            },
                        });
                    });
                }}
            />
            <Button title='Show Toast' onPress={showToast} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
