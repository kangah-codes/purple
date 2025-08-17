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
        fromAccount: type === 'transfer' ? accountId ?? '' : '',
        toAccount: '',
        type: '',
        accountId: accountId ?? '',
        date: new Date().toISOString(),
    };
}

export function getOrdinalSuffix(n: number) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function generateICalRRule(
    frequency: 'daily' | 'weekly' | 'monthly',
    dayOfWeek?: string,
    dayOfMonth?: number,
    time?: string,
) {
    const parts: string[] = [];
    // only did this to prevent import cycle from constants
    const DAYS_OF_WEEK = [
        { label: 'Sunday', value: '0' },
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
    ];

    switch (frequency) {
        case 'daily':
            parts.push('FREQ=DAILY');
            break;
        case 'weekly':
            parts.push('FREQ=WEEKLY');
            if (dayOfWeek) {
                const dayIndex = DAYS_OF_WEEK.findIndex((d) => d.value === dayOfWeek);
                if (dayIndex !== -1) {
                    parts.push(`BYDAY=${DAYS_OF_WEEK[dayIndex].label}`);
                }
            }
            break;
        case 'monthly':
            parts.push('FREQ=MONTHLY');
            if (dayOfMonth) {
                parts.push(`BYMONTHDAY=${dayOfMonth}`);
            }
            break;
    }

    if (time) {
        const [hours, minutes] = time.split(':');
        parts.push(`BYHOUR=${hours}`);
        parts.push(`BYMINUTE=${minutes}`);
    }

    return `RRULE:${parts.join(';')}`;
}

export function getTransactionColour(type: Transaction['type']) {
    switch (type) {
        case 'debit':
            return '#e7000b';
        case 'credit':
            return '#00a63e';
        case 'transfer':
            return '#9810fa';
    }
}
