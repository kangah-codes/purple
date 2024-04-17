import Avatar from '@/components/Shared/atoms/Avatar';
import { Text, View } from '@/components/Shared/styled';

export default function ProfileHeader() {
    return (
        <View className='flex items-center justify-center space-y-5'>
            <Avatar colour='purple' content='JA' size='xl' />

            <View className='flex flex-col items-center'>
                <Text style={{ fontFamily: 'Suprapower' }} className='text-2xl text-white'>
                    Joshua Akangah
                </Text>
                <Text
                    style={{ fontFamily: 'InterSemiBold' }}
                    className='text-base text-white tracking-tighter'
                >
                    akangah89@gmail.com
                </Text>
            </View>
        </View>
    );
}
