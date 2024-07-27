import { View } from '@/components/Shared/styled';
import { dummyAccountData } from '../constants';
import AccountCard from './AccountCard';

export default function AccountsAccordion() {
    return (
        <View className='flex flex-col space-y-5'>
            {dummyAccountData.map((account, index) => (
                <View key={`card-${index}`}>
                    <AccountCard {...account} />
                </View>
            ))}
        </View>
    );
}
