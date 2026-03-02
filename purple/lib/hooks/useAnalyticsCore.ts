import { useContext } from 'react';
import { AnalyticsContext } from '@/lib/providers/Analytics';

export function useAnalyticsCore() {
    const ctx = useContext(AnalyticsContext);
    if (!ctx) throw new Error('AnalyticsContext not found');
    return ctx;
}
