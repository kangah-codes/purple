import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

function AccountSummary({
    title,
    amount,
    color,
}: {
    title: string;
    amount: string;
    color: string;
}) {
    return (
        <View className='flex flex-col items-center'>
            <Text style={GLOBAL_STYLESHEET.interRegular} className='tracking-tighter'>
                {title}
            </Text>
            <Text
                style={[
                    GLOBAL_STYLESHEET.suprapower,
                    {
                        color,
                    },
                ]}
            >
                {amount}
            </Text>
        </View>
    );
}

export default function AccountsTotalSummary() {
    return (
        <View className='flex flex-row justify-between px-2.5 mb-5'>
            <AccountSummary title='Assets' amount='5,819.32' color='#34D399' />
            <AccountSummary title='Liabilities' amount='3,026.80' color='#DC2626' />
            <AccountSummary title='Total' amount='2,792.52' color='#7C3AED' />
        </View>
    );
}
