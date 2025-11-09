import React, { useState, useCallback } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import tw from 'twrnc';

const transactionTypes = [
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
];
const textStyle = [satoshiFont.satoshiMedium, tw`text-xs`];
const selectedTextStyle = [satoshiFont.satoshiBold, tw`text-xs`];

export default function TransactionTypeFilter() {
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

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
