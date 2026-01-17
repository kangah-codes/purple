import { GenericAPIResponse } from '@/@types/request';
import { LinearGradient, SafeAreaView, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { getDateRange } from '@/lib/utils/date';
import { useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccount, useAccountStore } from '../hooks';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import AccountInformation from '../molecules/AccountInformation';
import AccountNavigationArea from '../molecules/AccountNavigationArea';
import LoadingScreen from '../molecules/LoadingScreen';
import { Account } from '../schema';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import AccountTransactions from '../molecules/AccountTransactions';

const LINEAR_GRADIENT_COLORS = ['#D8B4FE', '#fff'];

function AccountScreen() {
    const { accountID } = useLocalSearchParams<{ accountID: string }>();
    const {
        setCurrentAccount,
        currentAccount,
        currentAccountRequestParams,
        setCurrentAccountRequestParams,
    } = useAccountStore();
    const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

    useEffect(() => {
        const defaultDateRange = getDateRange('1W');
        setCurrentAccountRequestParams({
            accountID,
            page_size: Infinity,
            currentSelection: '1W',
            startDate: defaultDateRange.startDate.toISOString(),
            endDate: defaultDateRange.endDate.toISOString(),
        });
    }, [accountID, setCurrentAccountRequestParams]);

    useScreenTracking('account', {
        source: 'navigation',
        account_id: currentAccount?.id,
    });

    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 20], [0, 1], Extrapolation.CLAMP),
        };
    });

    const { refetch: accountRefetch, isLoading: accountsLoading } = useAccount({
        accountID,
        options: {
            onSuccess: (data) => {
                setCurrentAccount((data as GenericAPIResponse<Account>).data);
            },
            onError: (error) => {
                console.error('[AccountScreen] Error fetching account details', error);
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'Error fetching account details',
                    },
                });
            },
        },
    });

    const {
        data: transactions,
        isLoading: transactionsLoading,
        refetch: transactionsRefetch,
    } = useTransactions({
        requestQuery: {
            accountID,
            start_date: currentAccountRequestParams.startDate,
            end_date: currentAccountRequestParams.endDate,
            page_size: currentAccountRequestParams.page_size,
        },
        options: {
            onError: (error) => {
                console.error('[AccountScreen] Error fetching transactions for account', error);
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: "Couldn't fetch account details",
                    },
                });
            },
            keepPreviousData: true,
        },
    });

    useEffect(() => {
        if (currentAccountRequestParams.startDate && currentAccountRequestParams.endDate) {
            transactionsRefetch();
        }
    }, [
        currentAccountRequestParams.startDate,
        currentAccountRequestParams.endDate,
        transactionsRefetch,
    ]);

    useEffect(() => {
        setCurrentAccountRequestParams({
            accountID,
            page_size: Infinity,
        });
    }, [accountID, setCurrentAccountRequestParams]);
    useEffect(() => {
        if (!accountsLoading && !transactionsLoading && !initialLoadComplete) {
            setInitialLoadComplete(true);
        }
    }, [accountsLoading, transactionsLoading, initialLoadComplete]);

    useRefreshOnFocus(transactionsRefetch);
    useRefreshOnFocus(accountRefetch);

    if (!initialLoadComplete) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={LINEAR_GRADIENT_COLORS}
                style={styles.parentView}
            />
            <ExpoStatusBar style='dark' />
            <AccountNavigationArea />
            <View className='relative'>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: 20,
                            zIndex: 999,
                        },
                        shadowStyle,
                    ]}
                    pointerEvents='none'
                >
                    <LinearGradient colors={['#dab2ff', 'transparent']} style={{ flex: 1 }} />
                </Animated.View>
                <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll}>
                    <AccountInformation transactions={transactions?.data ?? []} />
                    <AccountActivityAreaChart transactions={transactions?.data ?? []} />
                    <AccountTransactions
                        transactions={transactions?.data ?? []}
                        loading={transactionsLoading}
                    />
                </Animated.ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});

export default AccountScreen;
