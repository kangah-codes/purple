import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from '@/components/SVG/icons/noscale';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import CurrencyService from '@/lib/services/CurrencyService';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import ExchangeRateItem, { CurrencyCode } from '../molecules/ExchangeRateItem';

export default function ExchangeRatesScreen() {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>('high-to-low');
    const { preferences } = usePreferences();
    const renderItem = useCallback(
        ({ item }: { item: (typeof currencies)[0] }) => {
            const settingCurrency = currencies.find(
                (cur) => cur.code === item.code,
            ) as (typeof currencies)[number];

            return (
                <ExchangeRateItem
                    currency={settingCurrency}
                    selectedCurrency={preferences.currency}
                />
            );
        },
        [preferences, currencies],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-purple-100 h-[1px]' />,
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message={`Couldn't find any currencies which match "${searchValue}"`} />
            </View>
        ),
        [],
    );

    const calculateCurrency = useCallback(
        (currencyCode: string) => {
            const currencyService = CurrencyService.getInstance();
            return currencyService.convertCurrencySync({
                from: { currency: preferences.currency.toLowerCase() as CurrencyCode, amount: 1 },
                to: { currency: currencyCode.toLowerCase() as CurrencyCode },
            });
        },
        [preferences.currency],
    );

    const filteredData = useMemo(() => {
        return currencies
            .filter((currency) => {
                const searchString = `${currency.code} ${currency.country} ${currency.name}`;
                const matchesSearch = searchString
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
                return matchesSearch && currency.code !== preferences.currency;
            })
            .sort((a, b) => {
                const rateA = calculateCurrency(a.code);
                const rateB = calculateCurrency(b.code);

                return sortOrder === 'low-to-high' ? rateA - rateB : rateB - rateA;
            });
    }, [searchValue, preferences.currency, sortOrder, currencies, calculateCurrency]);

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>
                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Exchange Rates
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() =>
                        setSortOrder((prev) =>
                            prev === 'high-to-low' ? 'low-to-high' : 'high-to-low',
                        )
                    }
                    className='flex flex-row items-center justify-center'
                >
                    <ArrowDownIcon
                        width={20}
                        height={20}
                        stroke={sortOrder === 'low-to-high' ? '#9333ea' : '#dab2ff'}
                        strokeWidth={3}
                    />
                    <ArrowUpIcon
                        width={20}
                        height={20}
                        stroke={sortOrder === 'high-to-low' ? '#9333ea' : '#dab2ff'}
                        strokeWidth={3}
                    />
                </TouchableOpacity>
            </View>
            <View className='px-5'>
                <View className='relative flex justify-center mt-2.5 mb-5'>
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
                        style={{
                            position: 'absolute',
                            left: 15,
                        }}
                        stroke='#9333EA'
                    />
                </View>
                <LinearGradient
                    colors={['#f5f5f4', 'transparent']}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: -15,
                        height: 15,
                        zIndex: -1,
                    }}
                />
            </View>
            <FlashList
                estimatedItemSize={100}
                // @ts-expect-error
                data={filteredData}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmptylist}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
