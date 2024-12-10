import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { ArrowLeftIcon, EditSquareIcon, PlusIcon, TrashIcon } from '@/components/SVG/24x24';
import { ArrowNarrowUpRightIcon, DotsHorizontalIcon } from '@/components/SVG/noscale';
import HoldButton from '@/components/Shared/atoms/HoldButton';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
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
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Toast from 'react-native-toast-message';
import CustomBottomSheetModal from '../../Shared/molecules/GlobalBottomSheetModal';
import { useDeletePlan, usePlan } from '../hooks';
import PlanTransactionHistoryCard from '../molecules/PlanTransactionHistoryCard';
import { Plan, PlanTransaction } from '../schema';
import { generateSpendingTrendData } from '../utils';

type ExpenseScreenProps = {
    showBackButton?: boolean;
};
function ExpenseScreen(props: ExpenseScreenProps) {
    const [currentPlan, setCurrentPlan] = useState<Plan>();
    const { id } = useLocalSearchParams();
    const [visible, setVisible] = useState(false);
    const { sessionData } = useAuth();
    const { mutate, isLoading: deletePlanLoading } = useDeletePlan({
        sessionData: sessionData!,
        planID: id as string,
    });
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { data, isLoading, isError, refetch, isFetching } = usePlan({
        sessionData: sessionData as SessionData,
        planID: id as string,
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

    useEffect(() => {
        if (data) {
            // may the ts gods forgive me
            setCurrentPlan(data.data as unknown as Plan);
        }

        return () => {
            setCurrentPlan(undefined);
        };
    }, [data]);

    const chartData = useMemo(() => {
        if (!currentPlan) {
            return { projected: [], actual: [], ideal: [] };
        }

        return generateSpendingTrendData(currentPlan, 30, 5);
    }, [currentPlan]);

    const renderItem = useCallback(
        ({ item }: { item: PlanTransaction }) => <PlanTransactionHistoryCard data={item} />,
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

    if (!currentPlan) return null;

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={['#D8B4FE', '#fff']}
                style={styles.parentView}
            />
            <CustomBottomSheetModal
                modalKey={'planScreenModal'}
                snapPoints={['35%', '35%']}
                style={{
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
                }}
                handleIndicatorStyle={{
                    backgroundColor: '#D4D4D4',
                }}
            >
                <View className='flex flex-col p-5 space-y-10'>
                    <View className='flex flex-col space-y-2.5'>
                        <Text
                            style={GLOBAL_STYLESHEET.suprapower}
                            className='text-2xl text-black text-center'
                        >
                            Delete Plan?
                        </Text>
                        <Text
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            className='text-sm textblack text-center'
                        >
                            Are you sure you want to delete{' '}
                            {truncateStringIfLongerThan(currentPlan.name as string, 20)}
                        </Text>
                    </View>
                    <View>
                        <HoldButton
                            onComplete={() =>
                                mutate(undefined, {
                                    onError: () => {
                                        Toast.show({
                                            type: 'error',
                                            props: {
                                                text1: 'Error!',
                                                text2: 'There was an issue deleting plan',
                                            },
                                        });
                                    },
                                    onSuccess: (res) => {
                                        Toast.show({
                                            type: 'success',
                                            props: {
                                                text1: 'Success!',
                                                text2: 'Plan deleted successfully',
                                            },
                                        });
                                        router.replace('/(tabs)/plans');
                                    },
                                })
                            }
                            isLoading={deletePlanLoading}
                            progressColor='#dc2626'
                            backgroundColor='#e5e7eb'
                        >
                            <Text
                                style={GLOBAL_STYLESHEET.suprapower}
                                className='text-white text-lg'
                            >
                                Delete
                            </Text>
                        </HoldButton>
                    </View>
                </View>
            </CustomBottomSheetModal>
            <ExpoStatusBar style='dark' />
            <ScrollView>
                <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
                    <TouchableOpacity
                        onPress={router.back}
                        className='bg-purple-300 px-4 py-2 flex items-center justify-center rounded-full'
                    >
                        <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        {truncateStringIfLongerThan(currentPlan.name as string, 20)}
                    </Text>

                    <View className='flex flex-row space-x-2'>
                        <TouchableOpacity onPress={() => router.push('/plans/transaction')}>
                            <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                                <PlusIcon stroke={'#fff'} />
                            </View>
                        </TouchableOpacity>
                        <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                            <DropdownMenu
                                visible={visible}
                                handleOpen={() => setVisible(true)}
                                handleClose={() => setVisible(false)}
                                trigger={
                                    <DotsHorizontalIcon
                                        stroke='#fff'
                                        width='24'
                                        height='24'
                                        strokeWidth={2.5}
                                    />
                                }
                                padX={20}
                                dropdownWidth={180}
                            >
                                <MenuOption
                                    onSelect={() => {
                                        setVisible(false);
                                    }}
                                >
                                    <View className='flex flex-row items-center space-x-1'>
                                        <EditSquareIcon stroke='#A855F7' width={18} />
                                        <Text
                                            style={GLOBAL_STYLESHEET.interMedium}
                                            className='text-sm'
                                        >
                                            Edit Plan
                                        </Text>
                                    </View>
                                </MenuOption>
                                <MenuOption
                                    onSelect={() => {
                                        setShowBottomSheetModal('planScreenModal', true);
                                    }}
                                >
                                    <View className='flex flex-row items-center space-x-1'>
                                        <TrashIcon stroke='#EF4444' width={18} />
                                        <Text
                                            style={GLOBAL_STYLESHEET.interMedium}
                                            className='text-sm'
                                        >
                                            Delete
                                        </Text>
                                    </View>
                                </MenuOption>
                            </DropdownMenu>
                        </View>
                    </View>
                </View>

                <View className='px-5 flex flex-col'>
                    <Text
                        style={GLOBAL_STYLESHEET.suprapower}
                        className='text-black text-2xl tracking-tighter leading-[1.4] mt-1.5'
                    >
                        {formatCurrencyAccurate(currentPlan.currency, currentPlan.balance)}
                    </Text>
                    <View className='flex flex-row items-center space-x-1'>
                        <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        <Text
                            style={GLOBAL_STYLESHEET.interBold}
                            className='text-purple-500 text-sm tracking-tight'
                        >
                            GHS 250.98 today
                        </Text>
                    </View>
                </View>

                <View
                    className='pt-10 -ml-3 mr-3'
                    style={{
                        width: Dimensions.get('window').width + 11,
                    }}
                >
                    <LineChart
                        width={Dimensions.get('window').width}
                        height={220}
                        rotateLabel
                        // spacing={25}
                        areaChart
                        curved
                        curvature={0.025}
                        color1='#A855F7'
                        color2='#DB2777'
                        data={chartData.ideal}
                        data2={chartData.actual}
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
                        // hideRules
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

                <View>
                    <FlatList
                        data={currentPlan.Transactions}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={true}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        ListEmptyComponent={renderEmptylist}
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5fcff',
    },
    triggerStyle: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    triggerText: {
        fontSize: 16,
    },
});
export default ExpenseScreen;
