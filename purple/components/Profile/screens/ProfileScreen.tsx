import { LinearGradient, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Button, StatusBar as RNStatusBar } from 'react-native';
import ProfileHeader from '../molecules/ProfileHeader';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { PiggyBankIcon, SafeIcon } from '@/components/SVG/noscale';
import useHasOnboarded from '@/lib/db/db';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ProfileScreen() {
    const { setHasOnboarded } = useHasOnboarded();

    return (
        <View className='bg-white'>
            <ExpoStatusBar style='auto' />

            <View
                style={
                    {
                        // paddingTop: RNStatusBar.currentHeight,
                    }
                }
                className='space-y-'
            >
                <View className='relative'>
                    <View className='h-[300px]'>
                        <Image
                            source={require('@/assets/images/graphics/gradient.png')}
                            placeholder={blurhash}
                            contentFit='cover'
                            transition={100}
                            style={tw`flex flex-1 w-full`}
                        />
                    </View>

                    <View className='absolute items-center w-full justify-center h-full mt-2'>
                        <ProfileHeader />
                    </View>
                </View>

                <View className='px-5 rounded-2xl -mt-5 bg-white'>
                    <ScrollView
                        className='h-full flex flex-col space-y-5 mt-5'
                        contentContainerStyle={{
                            paddingBottom: 300,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* <View className='border-b border-gray-200 w-full' /> */}
                        <Button
                            title='RESET'
                            onPress={() => {
                                setHasOnboarded(false).then(() => alert('Onboarding reset'));
                            }}
                        />
                        <View className='flex flex-row space-x-2.5 justify-between'>
                            <View className='flex flex-col justify-between space-y-2.5 w-[48%]'>
                                <LinearGradient
                                    className='rounded-xl p-5 flex flex-col justify-between space-y-5'
                                    colors={['#C084FC', '#6B21A8']}
                                >
                                    <SafeIcon stroke='#fff' width={24} height={24} />
                                    <View className='flex flex-col space-y-1'>
                                        <Text
                                            style={{
                                                fontFamily: 'InterBold',
                                            }}
                                            className='text-white text-base tracking-tighter'
                                        >
                                            Accounts
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Suprapower',
                                            }}
                                            className='text-white text-4xl tracking-tighter'
                                        >
                                            12
                                        </Text>
                                    </View>
                                </LinearGradient>
                                <LinearGradient
                                    className='rounded-xl p-5 flex flex-col justify-between space-y-5 h-52'
                                    colors={['rgb(248, 113, 113)', 'rgb(185, 28, 28)']}
                                >
                                    <SafeIcon stroke='#fff' width={24} height={24} />
                                    <View className='flex flex-col space-y-1'>
                                        <Text
                                            style={{
                                                fontFamily: 'InterBold',
                                            }}
                                            className='text-white text-base tracking-tighter'
                                        >
                                            Total Spend
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Suprapower',
                                            }}
                                            className='text-white text-2xl tracking-tighter'
                                        >
                                            GHS 4.5M
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>

                            <View className='flex flex-col justify-between space-y-2.5 w-[48%]'>
                                <LinearGradient
                                    className='rounded-xl p-5 flex flex-col justify-between space-y-5 h-52'
                                    colors={['rgb(74, 222, 128)', 'rgb(21, 128, 61)']}
                                >
                                    <SafeIcon stroke='#fff' width={24} height={24} />
                                    <View className='flex flex-col space-y-1'>
                                        <Text
                                            style={{
                                                fontFamily: 'InterBold',
                                            }}
                                            className='text-white text-base tracking-tighter'
                                        >
                                            Total Saved
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Suprapower',
                                            }}
                                            className='text-white text-2xl tracking-tighter'
                                        >
                                            GHS 4.5M
                                        </Text>
                                    </View>
                                </LinearGradient>
                                <LinearGradient
                                    className='rounded-xl p-5 flex flex-col justify-between space-y-5'
                                    colors={['#C084FC', '#6B21A8']}
                                >
                                    <PiggyBankIcon stroke='#fff' width={24} height={24} />
                                    <View className='flex flex-col space-y-1'>
                                        <Text
                                            style={{
                                                fontFamily: 'InterBold',
                                            }}
                                            className='text-white text-base tracking-tighter'
                                        >
                                            Plans
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Suprapower',
                                            }}
                                            className='text-white text-4xl tracking-tighter'
                                        >
                                            12
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
