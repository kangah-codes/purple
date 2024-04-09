import { SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { StatusBar as RNStatusBar } from 'react-native';
import ProfileHeader from '../molecules/ProfileHeader';

export default function ProfileScreen() {
    return (
        <SafeAreaView className='bg-white'>
            <ExpoStatusBar style='dark' />
            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
                className='bg-white px-5 space-y-5'
            >
                <View className='flex flex-row justify-between items-center pt-2.5'>
                    <View className='flex flex-col'>
                        <Text style={{ fontFamily: 'Suprapower' }} className='text-lg'>
                            My Profile
                        </Text>
                    </View>
                </View>

                <ScrollView
                    className='mt-5 h-full flex flex-col space-y-5'
                    contentContainerStyle={{
                        paddingBottom: 300,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className=''>
                        <ProfileHeader />
                    </View>

                    <View className='border-b border-gray-200 w-full' />

                    <View className='bg-purple-100 rounded-xl p-5 flex flex-col space-y-2.5'>
                        <View className='flex flex-row justify-between items-center'>
                            <Text
                                className='text-sm text-purple-500 tracking-tighter'
                                style={{ fontFamily: 'InterSemiBold' }}
                            >
                                Email
                            </Text>
                            <Text
                                className='text-sm text-purple-900 tracking-tighter'
                                style={{ fontFamily: 'InterSemiBold' }}
                            >
                                test@test.com
                            </Text>
                        </View>

                        <View className='border-b border-purple-300 w-full' />

                        <View className='flex flex-row justify-between items-center'>
                            <Text
                                className='text-sm text-purple-500 tracking-tighter'
                                style={{ fontFamily: 'InterSemiBold' }}
                            >
                                Email
                            </Text>
                            <Text
                                className='text-sm text-purple-900 tracking-tighter'
                                style={{ fontFamily: 'InterSemiBold' }}
                            >
                                test@test.com
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
