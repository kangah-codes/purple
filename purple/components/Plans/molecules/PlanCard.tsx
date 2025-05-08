import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { Plan } from '../schema';

export default function PlanCard({ data, index }: { data: Plan; index: number }) {
    return (
        <TouchableOpacity
            className='p-4 bg-purple-50 rounded-3xl flex flex-col w-72 space-y-2.5'
            style={[
                {
                    marginLeft: index !== 0 ? 20 : 0,
                },
                styles.planCard,
            ]}
            onPress={() => {
                router.push(`/plans/${data.id}`);
            }}
        >
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-base text-black'>
                    {truncateStringIfLongerThan(data.name, 20)}
                </Text>

                <View className='rounded-full bg-purple-600 px-2.5 py-0.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiBlack}
                        className='text-xs text-purple-50 tracking-tighter'
                    >
                        {`${((data.balance / data.target || 0) * 100).toFixed(0)}%`}
                    </Text>
                </View>
            </View>

            <View className='h-[1px] bg-purple-200 w-full my-2.5' />

            <View className='flex flex-row justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-purple-600'>
                    {formatCurrencyRounded(data.balance, data.currency)}
                </Text>

                <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-purple-600'>
                    {formatCurrencyRounded(data.target, data.currency)}
                </Text>
            </View>

            <View className='flex flex-row items-center space-x-0.5'>
                <View
                    className='h-2 bg-purple-600 rounded-md'
                    style={{
                        width: `${Math.min((data.balance / data.target) * 100, 100)}%`,
                    }}
                />
                <View className='h-2 flex-grow bg-purple-200 rounded-full' />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    planCard: {
        // shadowColor: '#A855F7',
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.125,
        // shadowRadius: 80,
        // elevation: 3,
    },
});
