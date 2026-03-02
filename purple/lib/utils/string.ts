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
        if (!value) {
            // Skip undefined or null values
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item !== undefined && item !== null) {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
            }
        } else if (typeof value === 'object') {
            parts.push(stringify({ [key]: value }));
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    }

    return parts.join('&');
}

export function isEmoji(char: string) {
    // Get the code point of the character
    const codePoint = char.codePointAt(0);

    if (!codePoint) return false;

    // Check if it's in emoji ranges
    // Emoji ranges based on Unicode 14.0
    return (
        // Basic emoji
        (codePoint >= 0x1f600 && codePoint <= 0x1f64f) ||
        // Supplemental Symbols and Pictographs
        (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) ||
        // Emoticons
        (codePoint >= 0x1f600 && codePoint <= 0x1f64f) ||
        // Transport and Map Symbols
        (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) ||
        // Miscellaneous Symbols and Pictographs
        (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) ||
        // Flags
        (codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff) ||
        // Misc Technical
        (codePoint >= 0x2300 && codePoint <= 0x23ff) ||
        // Geometric Shapes
        (codePoint >= 0x25a0 && codePoint <= 0x25ff) ||
        // Misc Symbols
        (codePoint >= 0x2600 && codePoint <= 0x26ff) ||
        // Dingbats
        (codePoint >= 0x2700 && codePoint <= 0x27bf)
    );
}

export function isNotEmptyString(str?: string) {
    if (!str) return false;
    return str.trim().length > 0;
}

export function capitaliseFirstLetter(str: string) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export function stripEmojis(str: string) {
    return str.replace(/[\p{Extended_Pictographic}\p{Symbol}]/gu, '').trim();
}

export function extractEmojiOrDefault(str: string, defaultEmoji: string = '❓'): string {
    const regex = /\p{Extended_Pictographic}/u;
    const match = str.match(regex);
    return match ? match[0] : defaultEmoji;
}

export function removeEmojis(str: string): string {
    return str.replace(/\p{Extended_Pictographic}/gu, '').trim();
}
