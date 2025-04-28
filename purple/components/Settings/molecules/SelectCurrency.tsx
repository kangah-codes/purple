import { SearchIcon } from '@/components/SVG/noscale';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { InputField, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { currencies } from '@/lib/constants/currencies';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';

export default function SelectCurrency() {
    const [searchValue, setSearchValue] = useState<string>('');
    const { setPreference, preferences } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();

    const renderItem = useCallback(
        ({ item }: { item: (typeof currencies)[0] }) => {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setPreference('currency', item.code);
                        console.log('Udated preference', preferences.currency);
                        setShowBottomSheetFlatList('preferences-currency', false);
                    }}
                    className='py-3 border-b border-purple-100 flex flex-row space-x-2 items-center'
                >
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm'>
                        {item.emojiFlag} {item.name}
                    </Text>
                </TouchableOpacity>
            );
        },
        [preferences],
    );

    const filteredData = useMemo(() => {
        return currencies.filter((currency) => {
            const searchString = `${currency.code} ${currency.country} ${currency.name}`;
            return searchString.toLowerCase().includes(searchValue.toLowerCase());
        });
    }, [searchValue]);

    return (
        <CustomBottomSheetFlatList
            snapPoints={['50%', '70%', '85%']}
            children={
                <View className='flex flex-col space-y-2.5'>
                    <View className='w-full px-5 pb-2.5'>
                        <View className='relative flex justify-center mt-2.5'>
                            <InputField
                                className='bg-purple-50 rounded-full px-4 pl-10 text-xs h-12 text-gray-900'
                                style={GLOBAL_STYLESHEET.satoshiBold}
                                placeholder='Search'
                                cursorColor={'#000'}
                                onChangeText={setSearchValue}
                                value={searchValue}
                            />
                            <SearchIcon
                                width={16}
                                height={16}
                                style={styles.searchIcon}
                                stroke='#A855F7'
                            />
                        </View>
                    </View>
                </View>
            }
            sheetKey={'preferences-currency'}
            data={filteredData}
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
            keyExtractor={(item: { code: string }) => item.code}
        />
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
});
