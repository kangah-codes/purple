import { Text, View } from '@/components/Shared/styled';

export default function AccountsTotalSummary() {
    return (
        <View className='flex flex-row justify-between px-2.5'>
            <View className='flex flex-col items-center'>
                <Text
                    style={{
                        fontFamily: 'InterMedium',
                    }}
                    className='tracking-tighter'
                >
                    Assets
                </Text>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                        color: 'rgb(22 163 74)',
                    }}
                    className=''
                >
                    5,819.32
                </Text>
            </View>

            <View className='flex flex-col items-center'>
                <Text
                    style={{
                        fontFamily: 'InterMedium',
                    }}
                    className='tracking-tighter'
                >
                    Liabilities
                </Text>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                        color: '#DC2626',
                    }}
                >
                    3,026.80
                </Text>
            </View>

            <View className='flex flex-col items-center'>
                <Text
                    style={{
                        fontFamily: 'InterMedium',
                    }}
                    className='tracking-tighter'
                >
                    Total
                </Text>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                    className='text-purple-600'
                >
                    2,792.52
                </Text>
            </View>
        </View>
    );
}
