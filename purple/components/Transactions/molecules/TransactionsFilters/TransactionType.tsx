import React, { useState } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';

export default function TransactionTypeFilter() {
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const handleTypeSelect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes, id]));
    };

    const handleTypeDeselect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes].filter((t) => t !== id)));
    };

    const transactionTypes: Array<{ id: string; label: string }> = [
        { id: 'income', label: 'Income' },
        { id: 'expense', label: 'Expense' },
    ];

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap space-x-2'>
                {transactionTypes.map((type) => (
                    <View>
                        <SelectablePill
                            key={type.id}
                            id={type.id}
                            label={type.label}
                            isSelected={selectedTypes.has(type.id)}
                            onSelect={handleTypeSelect}
                            onDeselect={handleTypeDeselect}
                            textStyle={satoshiFont.satoshiMedium}
                            selectedTextStyle={satoshiFont.satoshiBold}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}
