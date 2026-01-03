import React from 'react';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import type { BudgetPaceInsight } from '@/components/Plans/hooks';

type BudgetPaceBannerProps = {
    paceInsight: BudgetPaceInsight | null;
};

export default function BudgetPaceBanner({ paceInsight }: BudgetPaceBannerProps) {
    if (!paceInsight) return null;

    const containerClassName =
        paceInsight.tone === 'negative'
            ? 'bg-red-50 border-red-100'
            : paceInsight.tone === 'positive'
            ? 'bg-green-50 border-green-100'
            : 'bg-purple-50 border-purple-100';

    const textClassName =
        paceInsight.tone === 'negative'
            ? 'text-red-600'
            : paceInsight.tone === 'positive'
            ? 'text-green-700'
            : 'text-purple-600';

    return (
        <View className={`mx-5 mt-5 mb-5 px-4 py-3 rounded-3xl border ${containerClassName}`}>
            <View className='flex-row items-center justify-between'>
                <Text className={`text-sm ${textClassName}`} style={satoshiFont.satoshiBold}>
                    {paceInsight.title}
                </Text>
            </View>
            <Text className={`text-xs mt-1 ${textClassName}`} style={satoshiFont.satoshiMedium}>
                {paceInsight.message}
            </Text>
        </View>
    );
}
