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
            const storedShowAmount = await nativeStorage.getItem('showAmount');
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
        nativeStorage.setItem('showAmount', showAmount).catch((error) => {
            console.error('Error saving showAmount:', error);
        });
    }, [showAmount]);

    const toggleShowAmount = useCallback(() => {
        setShowAmount((prev) => !prev);
    }, []);

    return (
        <>
            <BalanceDisplay
                showAmount={showAmount}
                setShowAmount={toggleShowAmount}
                balance={item.balance}
                accountName={item.name}
            />
            <View className='h-[1px] bg-gray-200 w-full my-2.5' />
            <ActionButtons account={item} />
        </>
    );
}

/**
 *  [
 * {"ID": "38a05679-0c4a-4365-bf5f-eadcd7e17c23", "balance": 0, "category": "💵 Cash",
 * "created_at": "2024-09-15T12:37:53.77406Z", "deleted_at": null, "is_default_account": true,
 * "name": "Cash", "updated_at": "2024-09-15T12:37:53.77406Z",
 * "user_id": "e25180d2-5153-4411-a637-0d57d9047e47"}]
 */
