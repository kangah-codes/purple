import React, { useState, useCallback, useEffect } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import tw from 'twrnc';
import { useTransactionStore } from '../../hooks';

const transactionTypes = [
    { id: 'debit', label: 'Expense' },
    { id: 'credit', label: 'Income' },
    { id: 'transfer', label: 'Transfer' },
];
const textStyle = [satoshiFont.satoshiMedium, tw`text-xs`];
const selectedTextStyle = [satoshiFont.satoshiBold, tw`text-xs`];

export default function TransactionTypeFilter() {
    const { pendingTransactionsFilter, setPendingTransactionsFilter } = useTransactionStore();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
        new Set(pendingTransactionsFilter.type || []),
    );

    // Reset local state when global filter is reset
    useEffect(() => {
        const globalTypes = new Set(pendingTransactionsFilter.type || []);
        setSelectedTypes(globalTypes);
    }, [pendingTransactionsFilter.type]);

    const handleTypeSelect = useCallback((id: string) => {
        setSelectedTypes((prev) => new Set([...prev, id]));
    }, []);

    const handleTypeDeselect = useCallback((id: string) => {
        setSelectedTypes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    // Update global filter when local selection changes
    useEffect(() => {
        const newTypes = Array.from(selectedTypes) as ('debit' | 'credit' | 'transfer')[];
        const currentTypes = pendingTransactionsFilter.type || [];

        // Only update if the arrays are different
        if (JSON.stringify(newTypes.sort()) !== JSON.stringify(currentTypes.sort())) {
            setPendingTransactionsFilter({
                ...pendingTransactionsFilter,
                type: newTypes,
            });
        }
    }, [selectedTypes, pendingTransactionsFilter, setPendingTransactionsFilter]);

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap space-x-2'>
                {transactionTypes.map((type) => (
                    <View key={type.id}>
                        <SelectablePill
                            id={type.id}
                            label={type.label}
                            isSelected={selectedTypes.has(type.id)}
                            onSelect={handleTypeSelect}
                            onDeselect={handleTypeDeselect}
                            textStyle={textStyle}
                            selectedTextStyle={selectedTextStyle}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}
