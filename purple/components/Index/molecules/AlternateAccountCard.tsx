import { Account } from '@/components/Accounts/schema';
import { View } from '@/components/Shared/styled';
import React from 'react';
import ActionButtons from './ActionButton';
import { BalanceDisplay } from './BalanceDisplay';

type AlternateAccountCardProps = {
    item: Account;
    pinnedAccount: string;
};

export default function AlternateAccountCard({ item, pinnedAccount }: AlternateAccountCardProps) {
    return (
        <>
            <BalanceDisplay
                accountName={item.name}
                account={item}
                isPinned={item.id === pinnedAccount}
            />
            <View className='h-[1px] bg-purple-200 w-full my-2.5' />
            <ActionButtons account={item} />
        </>
    );
}
