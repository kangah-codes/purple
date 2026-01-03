import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar as RNStatusBar } from 'react-native';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { satoshiFont } from '@/lib/constants/fonts';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';
import { MONTHS } from '../../constants';

type BudgetMonthSelectorProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function BudgetMonthSelector({ storiesRef }: BudgetMonthSelectorProps) {
    const { month, year, setMonthYear } = useCreateBudgetStore();
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear] = useState(year);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const generateYears = (threshold = 3) => {
        const years: number[] = [];
        for (let i = 0; i < threshold; i++) {
            years.push(currentYear + i);
        }
        return years;
    };

    const isMonthDisabled = (monthIndex: number, yearValue: number) => {
        if (yearValue > currentYear) return false;
        if (yearValue === currentYear) {
            return monthIndex < currentMonth;
        }
        return true;
    };

    const handleNext = () => {
        setMonthYear(selectedMonth, selectedYear);
        storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View className='flex flex-col space-y-5 h-[100%] relative px-5'>
                <SafeAreaView
                    className='flex flex-col space-y-2.5 h-[100%] relative'
                    style={{
                        paddingTop: RNStatusBar.currentHeight! * 2,
                    }}
                >
                    <View className='flex flex-col'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                            Which month is this budget for?
                        </Text>
                        <Text
                            style={satoshiFont.satoshiBold}
                            className='text-sm text-gray-600 mt-1'
                        >
                            Select the month you want to budget for
                        </Text>
                    </View>

                    <ScrollView
                        className='flex flex-col space-y-4'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 150 }}
                    >
                        {generateYears(1).map((yearValue) => (
                            <View key={yearValue} className='flex flex-col space-y-2'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-lg text-black mb-2'
                                >
                                    {yearValue}
                                </Text>

                                <View className='flex flex-row flex-wrap gap-2.5'>
                                    {MONTHS.map((monthName, index) => {
                                        const monthValue = index + 1;
                                        const isDisabled = isMonthDisabled(monthValue, yearValue);
                                        const isSelected =
                                            selectedMonth === monthValue &&
                                            selectedYear === yearValue;

                                        return (
                                            <TouchableOpacity
                                                key={monthName}
                                                disabled={isDisabled}
                                                onPress={() => {
                                                    setSelectedMonth(monthValue);
                                                    setSelectedYear(yearValue);
                                                }}
                                                className={`px-4 py-3 rounded-2xl ${
                                                    isDisabled
                                                        ? 'bg-gray-100 opacity-40'
                                                        : isSelected
                                                        ? 'bg-purple-500'
                                                        : 'bg-purple-50 border border-purple-100'
                                                }`}
                                                style={{ width: '30%' }}
                                            >
                                                <Text
                                                    style={satoshiFont.satoshiBold}
                                                    className={`text-sm text-center ${
                                                        isDisabled
                                                            ? 'text-gray-400'
                                                            : isSelected
                                                            ? 'text-white'
                                                            : 'text-purple-500'
                                                    }`}
                                                >
                                                    {monthName.slice(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

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
                                <TouchableOpacity style={{ width: '100%' }} onPress={handleNext}>
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
                </SafeAreaView>
            </View>
        </KeyboardAvoidingView>
    );
}
