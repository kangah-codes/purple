import { View } from '@/components/Shared/styled';
import { dummyAccountData } from '../constants';
import AccountCard from './AccountCard';
import { FlatList, StyleSheet } from 'react-native';
import { useCallback } from 'react';
import { keyExtractor } from '@/lib/utils/number';

export default function AccountsAccordion() {
    const renderItem = useCallback(({ item }: any) => <AccountCard {...item} />, []);

    return (
        <FlatList
            data={dummyAccountData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        // marginVertical: 20,
    },
});
