export function truncateStringIfLongerThan(str: string, maxLength: number) {
    if (!str) return '';
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
}

type ParsedQuery = {
    [key: string]: string | string[] | ParsedQuery | ParsedQuery[];
};

function tryDecodeURIComponent(str: string): string {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch {
        return str;
    }
}

function parseValue(value: string): string | number | boolean | null {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
    return value;
}

export function parse(qs: string): ParsedQuery {
    const queryString = qs.trim().replace(/^[?#&]/, '');

    if (!queryString) {
        return {};
    }

    const parsed: ParsedQuery = {};
    const pairs = queryString.split('&');

    for (const pair of pairs) {
        const [key, value] = pair.split('=').map(tryDecodeURIComponent);
        const parsedValue = parseValue(value);

        if (key in parsed) {
            if (Array.isArray(parsed[key])) {
                (parsed[key] as (string | number | boolean | null)[]).push(parsedValue);
            } else {
                parsed[key] = [parsed[key] as ParsedQuery, parsedValue as unknown as ParsedQuery];
            }
        } else {
            parsed[key] = parsedValue as unknown as ParsedQuery;
        }
    }

    return parsed;
}

export function stringify(obj: ParsedQuery): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
            }
        } else if (typeof value === 'object' && value !== null) {
            parts.push(stringify({ [key]: value }));
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    }

    return parts.join('&');
}

export function isNotEmptyString(str?: string) {
    if (!str) return false;
    return str.trim().length > 0;
}
