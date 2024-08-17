import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { IAccountCard } from '../schema';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { FlatList, StyleSheet } from 'react-native';
import { useCallback } from 'react';

export default function AccountCard({ accountName, accountTotal, subAccounts }: IAccountCard) {
    const navigation = useNavigation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const renderItemSeparator = useCallback(() => <View style={styles.separator} />, []);

    const renderItem = ({
        item,
        index,
    }: {
        item: {
            subAccountName: string;
            subAccountTotal: number;
        };
        index: number;
    }) => (
        <TouchableOpacity
            className='flex flex-row justify-between py-2.5'
            key={item.subAccountName + index}
            onPress={() => {
                router.push({
                    pathname: '/accounts/account-transactions',
                    params: { accountName },
                });
            }}
        >
            <Text style={GLOBAL_STYLESHEET.interMedium} className='tracking-tight'>
                {truncateStringIfLongerThan(item.subAccountName, 20)}
            </Text>
            <Text style={GLOBAL_STYLESHEET.interSemiBold} className='tracking-tight'>
                {formatCurrencyAccurate('GHS', item.subAccountTotal)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <>
            <View className='flex flex-row items-center justify-between px-5 py-2.5'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black'>
                    {truncateStringIfLongerThan(accountName, 20)}
                </Text>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-xs'>
                    {formatCurrencyAccurate('GHS', accountTotal)}
                </Text>
            </View>
            <View className='bg-purple-50 flex flex-col px-5 divide-y divide-purple-200'>
                <FlatList
                    data={subAccounts}
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
