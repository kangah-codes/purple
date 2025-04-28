import { ArrowLeftIcon, PlusIcon } from '@/components/SVG/24x24';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import { CustomTransactionType } from '../schema';

export default function CategoriesScreen() {
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
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
            <View className='w-full flex flex-row py-2.5 justify-between items-center px-5 relative'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        Transaction Categories
                    </Text>
                </View>
            </View>
            <FlashList
                estimatedItemSize={100}
                data={customTransactionTypes}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
            />
            <LinearGradient
                className='rounded-full  justify-center items-center space-y-4 absolute right-5 bottom-5'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                    onPress={() => {
                        router.push('/settings/new-transaction-category');
                    }}
                >
                    <PlusIcon stroke={'#fff'} />
                </TouchableOpacity>
            </LinearGradient>
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
