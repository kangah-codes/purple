import { ArrowNarrowDownRightIcon } from '@/components/SVG/noscale';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import React from 'react';
import { LinearGradient, Text, View } from '../../Shared/styled';
import { usePlanStore } from '../hooks';
import { PlanAccountPieChartStats } from '../schema';

type PlanAccountDeductionCardProps = {
    data: PlanAccountPieChartStats;
};

export default function PlanAccountDeductionCard({ data }: PlanAccountDeductionCardProps) {
    const { currentPlan } = usePlanStore();

    if (!currentPlan) return null;

    return (
        <View className='flex flex-row items-center justify-between py-2.5'>
            <View className='flex flex-col'>
                <View className='flex flex-row space-x-1.5 items-center'>
                    <LinearGradient
                        className='flex items-center justify-center rounded-full w-3 h-3'
                        colors={[data.gradientCenterColor, data.color]}
                    />
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-base text-black'>
                        {truncateStringIfLongerThan(data.accountName, 20)}
                    </Text>
                </View>
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowDownRightIcon width={16} height={16} stroke='rgb(75 85 99)' />
                    <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-gray-600 text-sm'>
                        {data.transactionCount} transaction{data.transactionCount > 1 && 's'}
                    </Text>
                </View>
            </View>
            <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-purple-600'>
                {formatCurrencyAccurate(currentPlan.currency, data.amount)}
            </Text>
        </View>
    );
}
