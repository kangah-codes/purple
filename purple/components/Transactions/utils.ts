import { RRule, rrulestr } from 'rrule';
import { Transaction } from './schema';
import { format, parse } from 'date-fns';

const DAYS_OF_WEEK = [
    { label: 'SU', value: '0' },
    { label: 'MO', value: '1' },
    { label: 'TU', value: '2' },
    { label: 'WE', value: '3' },
    { label: 'TH', value: '4' },
    { label: 'FR', value: '5' },
    { label: 'SA', value: '6' },
];

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

export function getRRuleFrequency(rruleString: string) {
    // if string contains invalid characters (eg monday instead of MO), replace them with valid ones
    const validRRuleString = rruleString
        .replace(/monday/gi, 'MO')
        .replace(/tuesday/gi, 'TU')
        .replace(/wednesday/gi, 'WE')
        .replace(/thursday/gi, 'TH')
        .replace(/friday/gi, 'FR')
        .replace(/saturday/gi, 'SA')
        .replace(/sunday/gi, 'SU');

    const rule = rrulestr(validRRuleString);

    let frequency: string;
    switch (rule.options.freq) {
        case RRule.DAILY:
            frequency = 'Daily';
            break;
        case RRule.WEEKLY:
            frequency = 'Weekly';
            break;
        case RRule.MONTHLY:
            frequency = 'Monthly';
            break;
        case RRule.YEARLY:
            frequency = 'Yearly';
            break;
        default:
            frequency = 'custom';
    }

    let time: string | undefined;
    if (
        Array.isArray(rule.options.byhour) &&
        rule.options.byhour.length > 0 &&
        Array.isArray(rule.options.byminute) &&
        rule.options.byminute.length > 0
    ) {
        const hour = rule.options.byhour[0].toString().padStart(2, '0');
        const minute = rule.options.byminute[0].toString().padStart(2, '0');
        time = `${hour}:${minute}`;
    }

    return {
        frequency,
        time,
    };
}

export function generateICalRRule(
    frequency: 'daily' | 'weekly' | 'monthly',
    dayOfWeek?: string,
    dayOfMonth?: number,
    time?: string,
) {
    const parts: string[] = [];

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

export function formatLocalTime(timeString: string) {
    // parse "HH:mm" into a Date
    const date = parse(timeString, 'HH:mm', new Date());

    return format(date, 'p');
}
