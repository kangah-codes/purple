import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import { ProfilePageLinkProps } from '../schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function ProfilePageLink({ icon, title, link }: ProfilePageLinkProps) {
    return (
        <TouchableOpacity>
            <View className='flex-row items-center justify-between py-2 w-full'>
                <View className='flex-row items-center space-x-2.5'>
                    <View className='bg-purple-50 rounded-full w-10 h-10 items-center justify-center'>
                        {icon}
                    </View>
                    <Text
                        style={GLOBAL_STYLESHEET.suprapower}
                        className='text-sm text-black tracking-tight'
                    >
                        {title}
                    </Text>
                </View>

                <ChevronRightIcon stroke='#9333ea' />
            </View>
        </TouchableOpacity>
    );
}
