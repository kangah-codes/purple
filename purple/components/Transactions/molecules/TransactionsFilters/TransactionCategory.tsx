import React, { useState } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import { usePreferences } from '@/components/Settings/hooks';
import tw from 'twrnc';

export default function TransactionCategoryFilter() {
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const handleTypeSelect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes, id]));
    };

    const handleTypeDeselect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes].filter((t) => t !== id)));
    };

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap gap-2'>
                {customTransactionTypes.map((category) => (
                    <View>
                        <SelectablePill
                            key={category.category}
                            id={category.category}
                            label={`${category.emoji} ${category.category}`}
                            isSelected={selectedTypes.has(category.category)}
                            onSelect={handleTypeSelect}
                            onDeselect={handleTypeDeselect}
                            textStyle={[satoshiFont.satoshiMedium, tw`text-xs`]}
                            selectedTextStyle={(satoshiFont.satoshiBold, tw`text-xs`)}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}
