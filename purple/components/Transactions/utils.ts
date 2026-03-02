import { RRule, rrulestr } from 'rrule';
import { Transaction } from './schema';
import { format, parse } from 'date-fns';

/**
 * Checks if a transaction is part of a transfer operation.
 * Transfer transactions are identified by having both from_account and to_account populated.
 * This helps exclude transfer transactions from income/expense reporting to avoid inflating totals.
 */
export function isTransferTransaction(transaction: Transaction): boolean {
    return Boolean(transaction.from_account && transaction.to_account);
}

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

// TEMP since old rules had full days
export function cleanRRuleString(str: string) {
    return str
        .replace(/monday/gi, 'MO')
        .replace(/tuesday/gi, 'TU')
        .replace(/wednesday/gi, 'WE')
        .replace(/thursday/gi, 'TH')
        .replace(/friday/gi, 'FR')
        .replace(/saturday/gi, 'SA')
        .replace(/sunday/gi, 'SU');
}

export function ruleToText(str: string) {
    const rrule = RRule.fromString(cleanRRuleString(str));

    let text = rrule.toText();
    const opts = rrule.options;
    const hour = opts.byhour?.[0] ?? 0;
    const minute = opts.byminute?.[0] ?? 0;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    const formattedTime = date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });

    // replace the time in the text with localized one
    if (text.includes('at')) {
        text = text.replace(/at\s+\d+(?::\d+)?/, `at ${formattedTime}`);
    }

    return text;
}

export function capitaliseFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRRuleFrequency(rruleString: string) {
    if (rruleString.trim() === '') {
        return {
            frequency: '',
            time: undefined,
        };
    }

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

export function formatLocalTime(timeString: string | undefined) {
    // parse "HH:mm" into a Date
    const date = parse(timeString ?? '', 'HH:mm', new Date());

    return format(date, 'p');
}

export function getMinimumEndDate(frequency?: string, startDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();

    switch (frequency) {
        case 'daily': {
            //  minimum is next day
            const dailyMin = new Date(start);
            dailyMin.setDate(dailyMin.getDate() + 1);
            return dailyMin;
        }
        case 'weekly': {
            // minimum is one week later
            const weeklyMin = new Date(start);
            weeklyMin.setDate(weeklyMin.getDate() + 7);
            return weeklyMin;
        }
        case 'monthly': {
            // minimum is one month later
            const monthlyMin = new Date(start);
            monthlyMin.setMonth(monthlyMin.getMonth() + 1);
            return monthlyMin;
        }
        default: {
            // default to next day if no frequency selected
            const defaultMin = new Date(start);
            defaultMin.setDate(defaultMin.getDate() + 1);
            return defaultMin;
        }
    }
}

export function calculateTransactionSchedule(
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom' | '',
    time: string,
    dayOfWeek?: string,
    dayOfMonth?: number,
    customDate?: Date,
) {
    let summary = '';

    const isValid =
        frequency === 'daily' ||
        (frequency === 'weekly' && dayOfWeek) ||
        (frequency === 'monthly' && dayOfMonth) ||
        (frequency === 'custom' && customDate);

    if (!isValid) {
        return null;
    }

    switch (frequency) {
        case 'daily':
            summary = `Transaction will be created daily at ${time}`;
            break;
        case 'weekly':
            summary = `Transaction will be created weekly on ${dayOfWeek} at ${time}`;
            break;
        case 'monthly': {
            const suffix = getOrdinalSuffix(dayOfMonth!);
            summary = `Transaction will be created on the ${dayOfMonth}${suffix} of each month at ${time}`;
            break;
        }
        case 'custom': {
            const day = customDate!.getDate();
            const suffixCustom = getOrdinalSuffix(day);
            const month = customDate!.toLocaleString('default', { month: 'long' });
            const year = customDate!.getFullYear();
            summary = `Transaction will be created on ${day}${suffixCustom} ${month} ${year} at ${time}`;
            break;
        }
    }

    return summary;
}
