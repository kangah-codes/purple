import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { EyeCloseIcon, EyeOpenIcon } from '../../SVG/noscale';

// TODO: Add types for props
export function BalanceDisplay({ showAmount, setShowAmount, balance, accountName }: any) {
    return (
        <>
            <View className='flex flex-row space-x-2 items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black text-sm'>
                    Available Balance
                </Text>
                {showAmount ? (
                    <EyeOpenIcon
                        width={16}
                        height={16}
                        stroke='black'
                        onPress={() => setShowAmount(false)}
                    />
                ) : (
                    <EyeCloseIcon
                        width={16}
                        height={16}
                        stroke='black'
                        onPress={() => setShowAmount(true)}
                    />
                )}
            </View>
            <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black text-3xl mt-1.5'>
                {showAmount ? balance : '********'}
            </Text>
            <Text
                style={GLOBAL_STYLESHEET.interMedium}
                className='text-gray-600 text-base tracking-tighter mt-1.5'
            >
                {accountName}
            </Text>
        </>
    );
}
