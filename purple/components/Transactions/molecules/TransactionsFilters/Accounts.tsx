import React, { useState } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import { useAccountStore } from '@/components/Accounts/hooks';
import { extractEmojiOrDefault } from '@/lib/utils/string';

export default function AccountsFilter() {
    const { accounts } = useAccountStore();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const handleSelect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes, id]));
    };
    const handleDeselect = (id: string) => {
        setSelectedTypes(new Set([...selectedTypes].filter((t) => t !== id)));
    };

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap gap-2'>
                {accounts.map((account) => {
                    const emoji = extractEmojiOrDefault(account.category, '');
                    return (
                        <View>
                            <SelectablePill
                                key={account.id}
                                id={account.id}
                                label={`${emoji} ${account.name}`}
                                isSelected={selectedTypes.has(account.id)}
                                onSelect={handleSelect}
                                onDeselect={handleDeselect}
                                textStyle={satoshiFont.satoshiMedium}
                                selectedTextStyle={satoshiFont.satoshiBold}
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
