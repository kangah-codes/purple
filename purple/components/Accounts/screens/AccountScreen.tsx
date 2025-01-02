import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { useInfiniteTransactions } from '@/components/Transactions/hooks';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Toast from 'react-native-toast-message';
import { useAccountStore } from '../hooks';
import { createTransactionChartData } from '../utils';

type AccountScreenProps = {
    showBackButton?: boolean;
};
const chartData = [
    { value: 15 },
    { value: 30 },
    { value: 26 },
    { value: 40 },
    // { value: 190, date: '3 Apr 2022' },
    // { value: 180, date: '4 Apr 2022' },
    // { value: 140, date: '5 Apr 2022' },
    // { value: 145, date: '6 Apr 2022' },
    // { value: 160, date: '7 Apr 2022' },
    // { value: 200, date: '8 Apr 2022' },

    // { value: 220, date: '9 Apr 2022' },
    // {
    //     value: 240,
    //     date: '10 Apr 2022',
    // },
    // { value: 280, date: '11 Apr 2022' },
    // { value: 260, date: '12 Apr 2022' },
    // { value: 340, date: '13 Apr 2022' },
    // { value: 385, date: '14 Apr 2022' },
    // { value: 280, date: '15 Apr 2022' },
    // { value: 390, date: '16 Apr 2022' },

    // { value: 370, date: '17 Apr 2022' },
    // { value: 285, date: '18 Apr 2022' },
    // { value: 295, date: '19 Apr 2022' },
    // {
    //     value: 300,
    //     date: '20 Apr 2022',
    // },
    // { value: 280, date: '21 Apr 2022' },
    // { value: 295, date: '22 Apr 2022' },
    // { value: 260, date: '23 Apr 2022' },
    // { value: 255, date: '24 Apr 2022' },

    // { value: 190, date: '25 Apr 2022' },
    // { value: 220, date: '26 Apr 2022' },
    // { value: 205, date: '27 Apr 2022' },
    // { value: 230, date: '28 Apr 2022' },
    // { value: 210, date: '29 Apr 2022' },
    // {
    //     value: 200,
    //     date: '30 Apr 2022',
    // },
    // { value: 240, date: '1 May 2022' },
    // { value: 250, date: '2 May 2022' },
    // { value: 280, date: '3 May 2022' },
    // { value: 250, date: '4 May 2022' },
    // { value: 210, date: '5 May 2022' },
];

function AccountScreen(props: AccountScreenProps) {
    const local = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { accountID, accountName } = local;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { currentAccount } = useAccountStore();
    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfiniteTransactions({
            sessionData: sessionData as SessionData,
            requestQuery: {
                accountID,
                page_size: 10,
            },
            options: {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: "We couldn't fetch your transactions",
                        },
                    });
                },
            },
        });

    const chartData = useMemo(() => createTransactionChartData(transactions), [transactions, data]);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    // flatten the data
    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setTransactions(tx);
        }
    }, [data]);

    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => {
                    // setCurrentTransaction(item);
                    setShowBottomSheetModal('transactionReceiptTransactionsScreen', true);
                }}
            />
        ),
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions for this account yet." />
            </View>
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );

    if (!currentAccount) return null;

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={['#D8B4FE', '#fff']}
                style={styles.parentView}
            />
            <ExpoStatusBar style='dark' />
            <ScrollView>
                <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        {truncateStringIfLongerThan(accountName as string, 20)}
                    </Text>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansSemiBold}
                            className='text-purple-600'
                        >
                            Back
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className='px-5 flex flex-col'>
                    <Text
                        style={GLOBAL_STYLESHEET.suprapower}
                        className='text-black text-2xl tracking-tighter leading-[1.4] mt-1.5'
                    >
                        {formatCurrencyAccurate(currentAccount.currency, currentAccount.balance)}
                    </Text>
                    <View className='flex flex-row items-center space-x-1'>
                        <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-purple-500 text-sm tracking-tight'
                        >
                            GHS 250.98 today
                        </Text>
                    </View>
                </View>

                {transactions.length > 2 && (
                    <View
                        className='pt-10 -ml-3 mr-3'
                        style={{
                            width: Dimensions.get('window').width + 11,
                        }}
                    >
                        <LineChart
                            width={Dimensions.get('window').width}
                            height={200}
                            rotateLabel
                            // spacing={25}
                            areaChart
                            curved
                            curvature={0.025}
                            color='#A855F7'
                            data={chartData}
                            // hideRules
                            hideYAxisText
                            // hide the line on the x axis
                            // hideAxesAndRules
                            // spacing={9.2}
                            // noOfSections={4}
                            startFillColor='#A855F7'
                            startOpacity={0.5}
                            endFillColor='#FAF5FF'
                            endOpacity={0.3}
                            // maxValue={900}
                            hideDataPoints
                            yAxisColor='white'
                            xAxisColor={'white'}
                            // hideYAxisText
                            // yAxisThickness={0}
                            // rulesType="solid"
                            // rulesColor="#F3E8FF"
                            // yAxisTextStyle={{ color: "gray" }}
                            // yAxisSide="right"
                            // xAxisColor="lightgray"
                            disableScroll
                            hideRules
                            // hideYAxisText
                            // hide the line on the x axis
                            // hideAxesAndRules
                            // isAnimated
                            animateOnDataChange
                            animationDuration={1200}
                            initialSpacing={0}
                            adjustToWidth
                            // spacing={30}
                            thickness={2.5}
                        />
                    </View>
                )}

                <View>
                    <FlatList
                        data={transactions}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={true}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        onRefresh={refetch}
                        refreshing={isFetching}
                        ListEmptyComponent={renderEmptylist}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bottomSheetModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 48,
        elevation: 10,
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    receiptContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    zigzag: {
        transform: [{ rotate: '180deg' }],
    },
    receipt: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
export default AccountScreen;
