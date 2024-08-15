import { ChevronRightIcon } from '@/components/SVG/16x16';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Platform, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { transactionData } from '../constants';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

const snapPoints = ['55%', '70%', '90%'];
const linearGradient = ['#c084fc', '#9333ea'];

export default function TransactionHistoryList() {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const renderZigZagView = useCallback(() => {
        let nodes = [];
        const numberOfTeeth = 60; // Increase the number of teeth

        for (let i = 0; i < numberOfTeeth; i++) {
            const point = `${10 * i},0 ${10 * i + 5},10 ${10 * (i + 1)},0`; // Adjust the spacing between teeth
            nodes.push(<Polygon key={i} points={point} strokeWidth='2' />);
        }
        return nodes;
    }, []);

    const renderItem = useCallback(
        ({ item }: any) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => setShowBottomSheetModal('transactionReceipt', true)}
            />
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );

    return (
        <View className='mt-5'>
            <CustomBottomSheetModal
                modalKey='transactionReceipt'
                snapPoints={snapPoints}
                style={styles.customBottomSheetModal}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <View className='px-5'>
                    <View
                        className='w-full flex flex-col space-y-5 items-center'
                        style={styles.receiptView}
                    >
                        <View className='w-full flex flex-col space-y-0.5 items-center justify-center'>
                            <Text
                                style={GLOBAL_STYLESHEET.suprapower}
                                className='text-lg text-gray-700'
                            >
                                Receipt
                            </Text>
                        </View>

                        <View className='w-full flex flex-col'>
                            <Svg
                                height={12}
                                width={'100%'}
                                style={styles.zigZag}
                                fill='#c084fc'
                                stroke='#c084fc'
                            >
                                {renderZigZagView()}
                            </Svg>
                            <LinearGradient
                                className='w-full py-5 flex items-center justify-center'
                                colors={linearGradient}
                            >
                                <View className='flex flex-col items-center space-y-1.5'>
                                    <View className='p-5 bg-red-100 rounded-full relative flex items-center justify-center'>
                                        <ArrowNarrowUpRightIcon
                                            width={16}
                                            height={16}
                                            style={{ position: 'absolute' }}
                                            stroke={'#B91C1C'}
                                        />
                                    </View>
                                    <Text
                                        style={GLOBAL_STYLESHEET.suprapower}
                                        className='text-lg text-white'
                                    >
                                        🏠 Rent
                                    </Text>
                                </View>
                            </LinearGradient>
                            <View
                                className='w-full p-5 flex flex-col items-center space-y-5 bg-white'
                                style={{
                                    backgroundColor:
                                        Platform.OS === 'android' ? '#F3F4F6' : 'white',
                                }}
                            >
                                <Text
                                    style={GLOBAL_STYLESHEET.suprapower}
                                    className='text-3xl text-black'
                                >
                                    $69.42
                                </Text>

                                <View className='border-b border-gray-200 w-full' />

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.suprapower}
                                        className='text-sm text-black'
                                    >
                                        Category
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        🏠 Rent
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.suprapower}
                                        className='text-sm text-black'
                                    >
                                        Note
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Payment for the month of June
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.suprapower}
                                        className='text-sm text-black'
                                    >
                                        Date
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Monday, June 9th 2024, at 12:00 PM
                                    </Text>
                                </View>
                            </View>
                            <Svg
                                height={12}
                                width={'100%'}
                                fill={Platform.OS === 'android' ? '#F3F4F6' : '#fff'}
                                stroke={Platform.OS === 'android' ? '#F3F4F6' : '#fff'}
                            >
                                {renderZigZagView()}
                            </Svg>
                        </View>
                    </View>
                </View>
            </CustomBottomSheetModal>
            <View className='flex flex-col'>
                <View className='flex flex-row w-full justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                        Transaction History
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/transactions')}
                        className='flex flex-row items-center space-x-1'
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            className='text-sm tracking-tighter text-purple-700'
                        >
                            View All
                        </Text>
                        <ChevronRightIcon stroke='#9333ea' />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={transactionData}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.flatlistContainerStyle}
                    showsVerticalScrollIndicator={true}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    zigZag: {
        transform: [{ rotate: '180deg' }],
    },
    customBottomSheetModal: {
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
    receiptView: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    flatlistContainerStyle: {
        paddingBottom: 200,
    },
});
