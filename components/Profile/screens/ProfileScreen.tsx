import { LinearGradient, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { StatusBar as RNStatusBar } from 'react-native';
import ProfileHeader from '../molecules/ProfileHeader';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { PiggyBankIcon, SafeIcon } from '@/components/SVG/icons';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ProfileScreen() {
    return (
        <View className='bg-white'>
            <ExpoStatusBar style='dark' />

            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
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

                        <View className='flex flex-row space-x-2.5 justify-between'>
                            <View className='flex flex-col justify-between space-y-2.5 w-[49%]'>
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
                                    className='rounded-xl p-5 h-52 flex-grow'
                                    colors={['#C084FC', '#6B21A8']}
                                ></LinearGradient>
                            </View>

                            <View className='flex flex-col justify-between space-y-2.5 w-[49%]'>
                                <View className='bg-[#D2C5FC] rounded-xl p-5 h-52 flex-grow'></View>
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
