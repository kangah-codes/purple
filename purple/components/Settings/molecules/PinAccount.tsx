import { useAccountStore } from '@/components/Accounts/hooks';
import { Account } from '@/components/Accounts/schema';
import Checkbox from '@/components/Shared/atoms/Checkbox';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';

export default function PinAccount() {
    const { setPreference, preferences } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { accounts } = useAccountStore();
    const handlePress = useCallback((item: Account) => {
        setPreference('pinnedAccount', item.id);
        setShowBottomSheetFlatList('preferences-pinned-account', false);
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: Account }) => {
            const isChecked = preferences.pinnedAccount === item.id;

            return (
                <TouchableOpacity
                    onPress={() => handlePress(item)}
                    className='py-3 border-b border-purple-100 flex flex-row space-x-2 items-center justify-between'
                >
                    <Text style={satoshiFont.satoshiBold} className='text-sm'>
                        {item.name}
                    </Text>

                    <Checkbox checked={isChecked} onChange={() => handlePress(item)} />
                </TouchableOpacity>
            );
        },
        [preferences.pinnedAccount, setPreference, setShowBottomSheetFlatList],
    );

    return (
        <CustomBottomSheetFlatList
            snapPoints={['50%', '70%', '85%']}
            sheetKey={'preferences-pinned-account'}
            data={accounts}
            containerStyle={{
                paddingHorizontal: 20,
            }}
            handleIndicatorStyle={{
                backgroundColor: '#D4D4D4',
            }}
            flatListContentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 20,
                backgroundColor: 'white',
            }}
            // @ts-expect-error
            renderItem={renderItem}
            keyExtractor={(item: Account) => item.id}
        />
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
});
