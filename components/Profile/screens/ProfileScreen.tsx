import { SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { StatusBar as RNStatusBar } from 'react-native';
import ProfileHeader from '../molecules/ProfileHeader';
import { Image } from 'expo-image';
import tw from 'twrnc';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

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

                    <View className='flex flex-row justify-between space-x-5'>
                        <View className='bg-purple-100 rounded-xl p-5 h-36 flex-grow'></View>
                        <View className='bg-purple-100 rounded-xl p-5 h-36 flex-grow'></View>
                    </View>

                    <View className='flex flex-row justify-between space-x-5'>
                        <View className='bg-purple-100 rounded-xl p-5 h-36 flex-grow'></View>
                        <View className='bg-purple-100 rounded-xl p-5 h-36 flex-grow'></View>
                    </View>

                    <View className='flex flex-1 items-center justify-center h-[300px]'>
                        <Image
                            source={require('@/assets/images/graphics/1.png')}
                            placeholder={blurhash}
                            contentFit='cover'
                            transition={100}
                            style={tw`flex flex-1 w-full`}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
