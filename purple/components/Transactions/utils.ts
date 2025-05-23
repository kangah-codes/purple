import { Transaction } from './schema';

export function getDefaultValues(
    transaction: Transaction | null,
    isUpdate: boolean,
    accountId?: string,
    type?: string,
) {
    if (isUpdate && transaction) {
        return {
            amount: transaction.amount ?? '',
            category: transaction.category ?? '',
            note: transaction.note ?? '',
            fromAccount: transaction.from_account ?? '',
            toAccount: transaction.to_account ?? '',
            type: transaction.type ?? '',
            accountId: transaction.account_id ?? '',
            date: transaction.created_at ?? new Date().toISOString(),
        };
    }

    return {
        amount: '',
        category: '',
        note: '',
        fromAccount: type === 'transfer' ? (accountId ?? '') : '',
        toAccount: '',
        type: '',
        accountId: accountId ?? '',
        date: new Date().toISOString(),
    };
}
