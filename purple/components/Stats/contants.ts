import { generatePalette } from '@/lib/utils/colour';

// export const weekColors = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];
export const dayKeys = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export type DayKey = (typeof dayKeys)[number];
export const weekColors = ['#dab2ff', '#ad46ff', '#8200db', '#59168b', '#59168b', '#3c0366'];
export const generatedPalette: string[] = Object.values(generatePalette('MY SEED TEST NEW SPd@.'))
    .map((colour) => colour)
    .reverse();
export const dayLabels: Record<DayKey, string> = {
    Su: 'S',
    Mo: 'M',
    Tu: 'T',
    We: 'W',
    Th: 'T',
    Fr: 'F',
    Sa: 'S',
};
