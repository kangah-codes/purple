import { SearchIcon } from '@/components/SVG/noscale';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { InputField, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import { Image } from 'expo-image';
import { satoshiFont } from '@/lib/constants/fonts';
import Checkbox from '@/components/Shared/atoms/Checkbox';

export default function SelectCurrency() {
    const [searchValue, setSearchValue] = useState<string>('');
    const { setPreference, preferences } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const renderItem = useCallback(
        ({ item }: { item: (typeof currencies)[0] }) => {
            const settingCurrency = currencies.find(
                (cur) => cur.code === item.code,
            ) as (typeof currencies)[number];
            const country = settingCurrency.locale.split('-')[1];
            const isChecked = preferences.currency === item.code;

            return (
                <TouchableOpacity
                    onPress={() => {
                        setPreference('currency', item.code);
                        setShowBottomSheetFlatList('preferences-currency', false);
                        setSearchValue('');
                    }}
                    className='py-3 border-b border-purple-100 flex flex-row space-x-2 items-center justify-between'
                >
                    <View className='flex flex-row space-x-2'>
                        <View className='w-[40] h-[40] flex items-center justify-center'>
                            <Image
                                style={{
                                    width: 37,
                                    height: 37,
                                    borderRadius: 40,
                                }}
                                source={{
                                    uri: `https://globalartinc.github.io/round-flags/flags/${country?.toLowerCase()}.svg`,
                                }}
                                contentFit='cover'
                                transition={500}
                            />
                        </View>
                        <View className='flex flex-col'>
                            <Text style={satoshiFont.satoshiBold} className='text-base'>
                                {/* {item.emojiFlag}  */}
                                {item.name} ({item.symbol})
                            </Text>
                            <Text style={satoshiFont.satoshiBold} className='text-sm text-gray-500'>
                                {/* {item.emojiFlag}  */}
                                {item.country}
                            </Text>
                        </View>
                    </View>

                    <Checkbox
                        checked={isChecked}
                        onChange={() => {
                            setPreference('currency', item.code);
                            setShowBottomSheetFlatList('preferences-currency', false);
                            setSearchValue('');
                        }}
                    />
                </TouchableOpacity>
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
