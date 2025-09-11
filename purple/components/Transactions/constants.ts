import { getOrdinalSuffix } from './utils';

export const TRANSACTION_RECURRENCE_RULES = [
    {
        label: 'Daily',
        value: 'daily',
    },
    {
        label: 'Weekly',
        value: 'weekly',
    },
    {
        label: 'Monthly',
        value: 'monthly',
    },
];

export const RECURRING_TRANSACTION_TYPES = [
    { key: 'debit', label: 'Expense' },
    { key: 'credit', label: 'Income' },
];

export const DAYS_OF_WEEK = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
];

export const WEEKDAY_MAP: Record<string, string> = {
    Sunday: 'SU',
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
};

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
        label: `${day}${getOrdinalSuffix(day)}`,
        value: day.toString(),
    };
});
