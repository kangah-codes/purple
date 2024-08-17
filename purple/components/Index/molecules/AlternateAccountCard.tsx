import { View } from '@/components/Shared/styled';
import { useState } from 'react';
import ActionButtons from './ActionButton';
import { BalanceDisplay } from './BalanceDisplay';

type AlternateAccountCardProps = {
    accountCurrency: string;
    accountBalance: number;
    accountName: string;
    cardBackgroundColour: string;
    cardTintColour: string;
};

export default function AlternateAccountCard({ item }: { item: AlternateAccountCardProps }) {
    const [showAmount, setShowAmount] = useState(true);

    return (
        <>
            <BalanceDisplay
                showAmount={showAmount}
                setShowAmount={setShowAmount}
                balance='$45,300,000'
                accountName={item.accountName}
            />
            <View className='h-[1px] bg-gray-200 w-full my-2.5' />
            <ActionButtons />
        </>
    );
}
