import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Account } from '../schema';

export default function AccountCard({
    groupName,
    accounts,
}: {
    groupName: string;
    accounts: Account[];
}) {
    const navigation = useNavigation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const renderItemSeparator = useCallback(() => <View style={styles.separator} />, []);

    const renderItem = ({ item, index }: { item: Account; index: number }) => (
        <TouchableOpacity
            className='flex flex-row justify-between py-2.5'
            key={item.name + index}
            onPress={() => {
                router.push({
                    pathname: '/accounts/account-transactions',
                    params: { accountName: item.name, accountID: item.ID },
                });
            }}
        >
            <Text style={GLOBAL_STYLESHEET.interMedium} className='tracking-tight'>
                {truncateStringIfLongerThan(item.name, 20)}
            </Text>
            <Text style={GLOBAL_STYLESHEET.interSemiBold} className='tracking-tight'>
                {formatCurrencyAccurate('GHS', item.balance)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <>
            <View className='flex flex-row items-center justify-between px-5 py-2.5'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black'>
                    {truncateStringIfLongerThan(groupName, 20)}
                </Text>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-xs'>
                    {formatCurrencyAccurate(
                        'GHS',
                        accounts.reduce((acc, curr) => acc + curr.balance, 0),
                    )}
                </Text>
            </View>
            <View className='bg-purple-50 flex flex-col px-5 divide-y divide-purple-200'>
                <FlatList
                    data={accounts}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false} // Disable scrolling for the nested FlatList
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: '#E9D8FD', // divide-purple-200
    },
});
