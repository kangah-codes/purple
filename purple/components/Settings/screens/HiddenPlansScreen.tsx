import { useInfinitePlans, usePlanStore } from '@/components/Plans/hooks';
import BudgetPlanCard from '@/components/Plans/molecules/BudgetCard';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { keyExtractor } from '@/lib/utils/number';
import { router, useFocusEffect } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect } from 'react';
import { FlatList, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function HiddenPlansScreen() {
    const { setSavingPlans, savingPlans } = usePlanStore();
    const { data, fetchNextPage, hasNextPage, isLoading, refetch } = useInfinitePlans({
        requestQuery: {
            page_size: 10,
            is_completed: true,
        },
        options: {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: "We couldn't fetch your plans",
                    },
                });
            },
        },
    });
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderEmptylist = useCallback(
        () => (
            <View className='my-10'>
                <EmptyList message="We couldn't find any plans here" />
            </View>
        ),
        [],
    );
    const listHeader = useCallback(() => {
        if (savingPlans.length === 0) return null;
        return (
            <View className='flex flex-col space-y-5 -px-5'>
                {/* <PlanInfoCard type='saving' /> */}
                <View />
            </View>
        );
    }, [savingPlans]);

    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setSavingPlans(tx);
        }
    }, [data]);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

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
                        Hidden Plans
                    </Text>
                </View>
            </View>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                numColumns={2}
                columnWrapperStyle={{ gap: 10 }}
                showsHorizontalScrollIndicator={false}
                data={savingPlans}
                renderItem={({ item }) => (
                    <View style={{ flex: 0.5 }}>
                        <BudgetPlanCard data={item} />
                    </View>
                )}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={itemSeparator}
                initialNumToRender={5}
                ListHeaderComponent={listHeader}
                refreshing={isLoading}
                onRefresh={refetch}
                ListEmptyComponent={renderEmptylist}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {},
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    itemSeparator: {
        height: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
