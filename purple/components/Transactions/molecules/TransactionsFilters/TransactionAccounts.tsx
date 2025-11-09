import React, { useState, useMemo, useCallback } from 'react';
import { View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import { useAccountStore } from '@/components/Accounts/hooks';
import { extractEmojiOrDefault } from '@/lib/utils/string';
import tw from 'twrnc';
import { useTransactionStore } from '../../hooks';

const textStyle = [satoshiFont.satoshiMedium, tw`text-xs`];
const selectedTextStyle = [satoshiFont.satoshiBold, tw`text-xs`];

export default function AccountsFilter() {
    const { accounts } = useAccountStore();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const { transactionsFilter, setTransactionsFilter } = useTransactionStore();

    const handleSelect = useCallback((id: string) => {
        setSelectedTypes((prev) => new Set([...prev, id]));
    }, []);

    const handleDeselect = useCallback((id: string) => {
        setSelectedTypes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    const processedAccounts = useMemo(() => {
        return accounts.map((account) => ({
            id: account.id,
            name: account.name,
            emoji: extractEmojiOrDefault(account.category, ''),
            label: `${extractEmojiOrDefault(account.category, '')} ${account.name}`,
        }));
    }, [accounts]);

    return (
        <View className='p-5 bg-purple-50'>
            <View className='flex flex-row flex-wrap gap-2'>
                {processedAccounts.map((account) => (
                    <View key={account.id}>
                        <SelectablePill
                            id={account.id}
                            label={account.label}
                            isSelected={selectedTypes.has(account.id)}
                            onSelect={handleSelect}
                            onDeselect={handleDeselect}
                            textStyle={textStyle}
                            selectedTextStyle={selectedTextStyle}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}
