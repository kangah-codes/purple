import React, { useState, useMemo, useCallback } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import { usePreferences } from '@/components/Settings/hooks';
import tw from 'twrnc';

const textStyle = [satoshiFont.satoshiMedium, tw`text-xs`];
const selectedTextStyle = [satoshiFont.satoshiBold, tw`text-xs`];

export default function TransactionCategoryFilter() {
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
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

    const processedCategories = useMemo(() => {
        return customTransactionTypes.map((category) => ({
            id: category.category,
            category: category.category,
            emoji: category.emoji,
            label: `${category.emoji} ${category.category}`,
        }));
    }, [customTransactionTypes]);

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap gap-2'>
                {processedCategories.map((category) => (
                    <View key={category.id}>
                        <SelectablePill
                            id={category.id}
                            label={category.label}
                            isSelected={selectedTypes.has(category.id)}
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
