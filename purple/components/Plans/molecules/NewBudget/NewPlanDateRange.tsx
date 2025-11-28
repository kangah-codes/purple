import DateRangePicker from '@/components/Shared/atoms/DateRangePicker';
import GlobalBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import React, { memo, useCallback, useEffect } from 'react';
import { useCreateNewPlanStore } from '../../hooks';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

type NewPlanDateRange = {
    storiesRef: React.RefObject<StoriesRef>;
};

function NewPlanDateRange({ storiesRef }: NewPlanDateRange) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { startDate, endDate, setStartDate, setEndDate } = useCreateNewPlanStore();

    const handleDateRangeChange = useCallback(
        (dateRange: DateRange) => {
            if (dateRange.startDate) {
                setStartDate(new Date(dateRange.startDate));
            }
            if (dateRange.endDate) {
                setEndDate(new Date(dateRange.endDate));
            }
        },
        [setStartDate, setEndDate],
    );

    useEffect(() => {
        if (startDate && endDate) {
            // add a small delay
            const timeout = setTimeout(() => {
                setShowBottomSheetModal('newPlanDateRange', false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [startDate, endDate, setShowBottomSheetModal]);

    const formatDateRange = React.useMemo(() => {
        if (!startDate && !endDate) {
            return 'Select period';
        }

        if (startDate && !endDate) {
            return format(startDate, 'd MMM');
        }

        if (startDate && endDate) {
            return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM')}`;
        }

        return 'Select period';
    }, [startDate, endDate]);

    return (
        <>
            <View className='flex flex-col space-y-5 justify-center h-[100%] relative px-5'>
                <View className='flex flex-col space-y-2.5'>
                    <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                        How long should this budget last?
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowBottomSheetModal('newPlanDateRange', true)}
                    className='flex flex-row justify-between items-center'
                >
                    <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                        {formatDateRange}
                    </Text>
                </TouchableOpacity>

                <View className='items-center self-center justify-center absolute bottom-7 w-full'>
                    <View className='flex flex-row space-x-2.5 justify-between w-full'>
                        <View className='flex-1'>
                            <TouchableOpacity
                                onPress={() =>
                                    storiesRef?.current?.goToPage(
                                        storiesRef.current.currentIndex - 1,
                                    )
                                }
                                style={{ width: '100%' }}
                                className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-purple-600 text-center'
                                >
                                    Back
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className='flex-1'>
                            <TouchableOpacity
                                style={{ width: '100%' }}
                                onPress={() =>
                                    storiesRef?.current?.goToPage(
                                        storiesRef.current.currentIndex + 1,
                                    )
                                }
                                disabled={!startDate || !endDate}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 h-[50]'
                                    colors={
                                        startDate && endDate
                                            ? ['#c084fc', '#9333ea']
                                            : ['#f9fafb', '#e5e7eb']
                                    }
                                    style={{
                                        width: '100%',
                                        borderColor:
                                            !startDate || !endDate ? '#e5e7eb' : 'transparent',
                                        borderWidth: 1,
                                    }}
                                >
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className={`text-center ${
                                            startDate && endDate ? 'text-white' : 'text-gray-500'
                                        }`}
                                    >
                                        Next
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <GlobalBottomSheetModal
                modalKey={'newPlanDateRange'}
                snapPoints={['50%', '50%']}
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
                <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                    <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                        initialDateRange={{
                            startDate: startDate?.toISOString() || null,
                            endDate: endDate?.toISOString() || null,
                        }}
                        minDate={new Date().toISOString()}
                        maxDate={new Date(
                            new Date().setFullYear(new Date().getFullYear() + 5),
                        ).toISOString()}
                    />
                </BottomSheetScrollView>
            </GlobalBottomSheetModal>
        </>
    );
}

export default memo(NewPlanDateRange);
