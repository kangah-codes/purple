import React from 'react';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';
import { usePreferences } from '@/components/Settings/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { router } from 'expo-router';

type BudgetCategorySetupProps = {
    searchQuery?: string;
};

export function BudgetCategorySetup({ searchQuery = '' }: BudgetCategorySetupProps) {
    const { categoryLimits } = useCreateBudgetStore();
    const {
        preferences: { customTransactionTypes, currency },
    } = usePreferences();

    const filteredTransactions = customTransactionTypes
        .map((tx) => `${tx.emoji} ${tx.category}`)
        .filter((transaction) =>
            searchQuery.trim().length === 0
                ? true
                : transaction.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        );

    const totalAllocated = categoryLimits.reduce((sum, limit) => sum + limit.limitAmount, 0);
    const getCategoryAmount = (category: string) => {
        const limit = categoryLimits.find((l) => l.category === category);
        return limit?.limitAmount || 0;
    };

    return (
        <View className='flex flex-col space-y-2.5 bg-purple-50 rounded-3xl border border-purple-100 p-5'>
            {filteredTransactions.length === 0 ? (
                <View className='py-6'>
                    <EmptyList
                        message={
                            searchQuery.trim().length > 0
                                ? `Couldn't find any categories which match "${searchQuery.trim()}"`
                                : 'Looks like there are no categories yet.'
                        }
                    />
                </View>
            ) : (
                <>
                    <View className='flex-row justify-between items-center'>
                        <Text className='text-base text-black' style={satoshiFont.satoshiBold}>
                            Fixed
                        </Text>

                        <View className='flex-row items-center'>
                            <Text
                                className='text-sm text-purple-500 w-20 text-right'
                                style={satoshiFont.satoshiBlack}
                            >
                                {formatCurrencyRounded(totalAllocated, currency)}
                            </Text>
                        </View>
                    </View>

                    <View className='h-[1px] border-b border-purple-100 w-full' />

                    <View className='flex flex-col'>
                        {filteredTransactions.map((transaction, idx) => (
                            <React.Fragment key={idx}>
                                <View
                                    className={`flex-row justify-between items-center ${
                                        idx === filteredTransactions.length - 1
                                            ? 'pt-2.5 pb-1'
                                            : 'py-2.5'
                                    }`}
                                >
                                    <View className='flex-row items-center flex-1 mr-4'>
                                        <Text
                                            className='text-sm text-black flex-1'
                                            style={satoshiFont.satoshiBold}
                                            numberOfLines={1}
                                            ellipsizeMode='tail'
                                        >
                                            {transaction.replace(' ', '   ')}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        className='flex-row items-center self-start bg-purple-100 px-2.5 py-1 rounded-lg'
                                        onPress={() =>
                                            router.push({
                                                pathname: '/plans/set-category-amount',
                                                params: {
                                                    category: transaction,
                                                    currentAmount:
                                                        getCategoryAmount(transaction).toString(),
                                                },
                                            })
                                        }
                                    >
                                        <Text
                                            className='text-sm text-purple-500'
                                            style={satoshiFont.satoshiBlack}
                                        >
                                            {formatCurrencyRounded(
                                                getCategoryAmount(transaction),
                                                currency,
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {idx < filteredTransactions.length - 1 && (
                                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}
