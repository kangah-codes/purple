function seedRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash = hash & hash;
    }
    return () => {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
    };
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

interface ColorPalette {
    color600: string; // Darkest
    color500: string;
    color400: string;
    color300: string;
    color200: string;
    color100: string; // Lightest
}

export function generatePalette(seed: string): ColorPalette {
    const random = seedRandom(seed);

    // Generate base HSL values
    const hue = Math.floor(random() * 360);
    const saturation = 65 + random() * 20; // Keep saturation moderate-high

    // Generate palette with decreasing lightness
    return {
        color600: hslToHex(hue, saturation, 35), // Darker shade
        color500: hslToHex(hue, saturation, 45),
        color400: hslToHex(hue, saturation, 55),
        color300: hslToHex(hue, saturation, 65),
        color200: hslToHex(hue, saturation, 80),
        color100: hslToHex(hue, saturation, 95), // Lightest shade
    };
}
