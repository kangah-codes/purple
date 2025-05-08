import { View } from '@/components/Shared/styled';
import { useCallback, useEffect, useState } from 'react';
import ActionButtons from './ActionButton';
import { BalanceDisplay } from './BalanceDisplay';
import { nativeStorage } from '@/lib/utils/storage';
import { Account } from '@/components/Accounts/schema';
import React from 'react';

export default function AlternateAccountCard({ item }: { item: Account }) {
    const [showAmount, setShowAmount] = useState(false);

    const getShowAmount = useCallback(async () => {
        try {
            const storedShowAmount = nativeStorage.getItem('showAmount');
            setShowAmount(!!storedShowAmount);
        } catch (error) {
            console.error('Error fetching showAmount:', error);
            // Optionally set a default value here
            setShowAmount(false);
        }
    }, []);

    useEffect(() => {
        getShowAmount();
    }, [getShowAmount]);

    useEffect(() => {
        nativeStorage.setItem('showAmount', showAmount);
    }, [showAmount]);

    const toggleShowAmount = useCallback(() => {
        setShowAmount((prev) => !prev);
    }, []);

    return (
        <>
            <BalanceDisplay
                showAmount={true}
                setShowAmount={toggleShowAmount}
                balance={item.balance}
                accountName={item.name}
                account={item}
            />
            <View className='h-[1px] bg-purple-200 w-full my-2.5' />
            <ActionButtons account={item} />
        </>
    );
}
