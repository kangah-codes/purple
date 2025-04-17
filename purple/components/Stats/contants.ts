export const weekColors = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];
export const dayKeys = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export type DayKey = (typeof dayKeys)[number];
export const dayLabels: Record<DayKey, string> = {
    Su: 'S',
    Mo: 'M',
    Tu: 'T',
    We: 'W',
    Th: 'T',
    Fr: 'F',
    Sa: 'S',
};
