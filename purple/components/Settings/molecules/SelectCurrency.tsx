import { SearchIcon } from '@/components/SVG/icons/noscale';
import CurrencySelect from '@/components/Shared/molecules/CurrencySelect';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { InputField, View } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import CurrencyService from '@/lib/services/CurrencyService';
import { CurrencyCode } from './ExchangeRateItem';

type SelectCurrencyProps = {
    callback: (item: (typeof currencies)[0]) => void;
};

export default function SelectCurrency({ callback }: SelectCurrencyProps) {
    const [searchValue, setSearchValue] = useState<string>('');
    const { setPreference, preferences } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const renderItem = useCallback(
        ({ item }: { item: (typeof currencies)[0] }) => {
            const settingCurrency = currencies.find(
                (cur) => cur.code === item.code,
            ) as (typeof currencies)[number];

            return (
                <CurrencySelect
                    currency={settingCurrency}
                    callback={() => {
                        setSearchValue('');
                        callback(item);
                    }}
                    selectedCurrency={preferences.currency}
                />
            );
        },
        [preferences, currencies],
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
                                className='bg-purple-50 rounded-full px-4 pl-10 text-xs h-12 text-gray-900 border border-purple-200'
                                style={satoshiFont.satoshiBold}
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
