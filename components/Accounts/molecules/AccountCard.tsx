import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { IAccountCard } from '../schema';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';

export default function AccountCard({ accountName, accountTotal, subAccounts }: IAccountCard) {
    const navigation = useNavigation();
    const router = useRouter();
    const params = useLocalSearchParams();

    return (
        <View className='flex flex-col space-y-2.5'>
            <View className='flex flex-row items-center justify-between px-5'>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                    className='text-black'
                >
                    {truncateStringIfLongerThan(accountName, 20)}
                </Text>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                    className='text-xs'
                >
                    {formatCurrencyAccurate('GHS', accountTotal)}
                </Text>
            </View>
            <View className='bg-purple-50 flex flex-col px-5 divide-y divide-purple-200'>
                {subAccounts.map((subAccount, index) => (
                    <TouchableOpacity
                        className='flex flex-row justify-between py-2.5'
                        key={subAccount.subAccountName + index}
                        onPress={() => {
                            router.push({
                                pathname: '/accounts/account-transactions',
                                params: { accountName },
                            });
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'InterMedium',
                            }}
                            className='tracking-tight'
                        >
                            {truncateStringIfLongerThan(subAccount.subAccountName, 20)}
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'InterSemiBold',
                            }}
                            className='tracking-tight'
                        >
                            {formatCurrencyAccurate('GHS', subAccount.subAccountTotal)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
