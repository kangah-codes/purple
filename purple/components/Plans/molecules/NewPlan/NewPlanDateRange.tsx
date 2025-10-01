import DateRangePicker from '@/components/Shared/atoms/DateRangePicker';
import GlobalBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import React, { memo, useCallback, useEffect } from 'react';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

type NewPlanDateRange = {
    storiesRef: React.RefObject<StoriesRef>;
};

function NewPlanDateRange({ storiesRef }: NewPlanDateRange) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>({
        startDate: null,
        endDate: null,
    });

    const handleDateRangeChange = useCallback((dateRange: DateRange) => {
        setSelectedDateRange(dateRange);
    }, []);

    useEffect(() => {
        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            // add a small delay
            const timeout = setTimeout(() => {
                setShowBottomSheetModal('newPlanDateRange', false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [selectedDateRange.startDate, selectedDateRange.endDate, setShowBottomSheetModal]);

    const formatDateRange = React.useMemo(() => {
        if (!selectedDateRange.startDate && !selectedDateRange.endDate) {
            return 'Select period';
        }

        if (selectedDateRange.startDate && !selectedDateRange.endDate) {
            return format(new Date(selectedDateRange.startDate), 'd MMM');
        }

        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            return `${format(new Date(selectedDateRange.startDate), 'd MMM')} - ${format(
                new Date(selectedDateRange.endDate),
                'd MMM',
            )}`;
        }

        return 'Select period';
    }, [selectedDateRange.startDate, selectedDateRange.endDate]);

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
                                // disabled={true}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 h-[50]'
                                    colors={['#c084fc', '#9333ea']}
                                    style={{ width: '100%' }}
                                >
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-white text-center'
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
                        initialDateRange={selectedDateRange}
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
