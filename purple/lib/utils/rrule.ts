const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function parseRRule(rruleString: string) {
    const parts = rruleString.replace(/^RRULE:/, '').split(';');
    const rule: Record<string, any> = {};
    for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 'BYDAY') {
            rule[key] = value.split(',');
        } else if (key === 'BYHOUR' || key === 'BYMINUTE') {
            rule[key] = value.split(',').map((v) => parseInt(v, 10));
        } else if (key === 'INTERVAL' || key === 'COUNT') {
            rule[key] = parseInt(value, 10);
        } else {
            rule[key] = value;
        }
    }
    return rule;
}

export function occurrencesBetween(
    rruleString: string,
    dtStart: Date,
    start: Date,
    end: Date,
): Date[] {
    const rule = parseRRule(rruleString);
    const occurrences: Date[] = [];

    const freq = rule['FREQ'] || 'DAILY';
    const interval = rule['INTERVAL'] || 1;
    const byHour = rule['BYHOUR'] || [dtStart.getUTCHours()];
    const byMinute = rule['BYMINUTE'] || [dtStart.getUTCMinutes()];
    const byDay = rule['BYDAY'] || null;
    const until = rule['UNTIL'] ? new Date(rule['UNTIL']) : null;
    const count = rule['COUNT'] || null;

    let cursor = new Date(dtStart);

    while (cursor <= end) {
        // check UNTIL
        if (until && cursor > until) break;

        // check BYDAY
        if (!byDay || byDay.includes(WEEKDAYS[cursor.getUTCDay()])) {
            for (const h of byHour) {
                for (const m of byMinute) {
                    const occurrence = new Date(cursor);
                    occurrence.setUTCHours(h, m, 0, 0);

                    if (occurrence >= start && occurrence <= end) {
                        occurrences.push(occurrence);

                        if (count && occurrences.length >= count) {
                            return occurrences;
                        }
                    }
                }
            }
        }

        // step forward based on FREQ
        if (freq === 'DAILY') {
            cursor.setUTCDate(cursor.getUTCDate() + interval);
        } else if (freq === 'WEEKLY') {
            cursor.setUTCDate(cursor.getUTCDate() + 7 * interval);
        } else if (freq === 'MONTHLY') {
            cursor.setUTCMonth(cursor.getUTCMonth() + interval);
        } else {
            throw new Error(`FREQ=${freq} not implemented`);
        }
    }

    return occurrences;
}
