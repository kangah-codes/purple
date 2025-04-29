import { ArrowLeftIcon, PlusIcon } from '@/components/SVG/24x24';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import { CustomTransactionType } from '../schema';
import { SearchIcon } from '@/components/SVG/noscale';

export default function CategoriesScreen() {
    const [searchValue, setSearchValue] = useState('');
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const filteredData = useMemo(() => {
        return customTransactionTypes.filter((category) => {
            const searchString = `${category.emoji} ${category.category}`;
            return searchString.toLowerCase().includes(searchValue.toLowerCase());
        });
    }, [searchValue]);
    const renderItem = useCallback(({ item }: { item: CustomTransactionType }) => {
        return (
            <View className='py-3'>
                <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-base text-gray-800'>
                    {`${item.emoji} ${item.category}`}
                </Text>
            </View>
        );
    }, []);
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions plans yet." />
            </View>
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-purple-100 h-[1px]' />,
        [],
    );

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
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        Categories
                    </Text>
                </View>

                <Link
                    href={{
                        pathname: '/settings/new-transaction-category',
                    }}
                >
                    <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                        <PlusIcon stroke={'#fff'} />
                    </View>
                </Link>
            </View>
            <View className='px-5 border-b'>
                <View className='relative flex justify-center mt-2.5 mb-5'>
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
                        style={{
                            position: 'absolute',
                            left: 15,
                        }}
                        stroke='#9333EA'
                    />
                </View>
            </View>
            <FlashList
                estimatedItemSize={100}
                data={filteredData}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
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
