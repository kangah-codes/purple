import React from 'react';
import { Transaction } from '@/components/Transactions/schema';
import IndexHeatmap from './IndexHeatmap';
import IndexSpendAreaChart from './IndexSpendAreaChart';
import IndexNetworthAreaChart from './IndexNetworthAreaChart';

export type IndexStatsCardId = 'spend' | 'activity' | 'netWorth';
export type IndexStatsCardRenderContext = {
    startDate: Date;
    transactions: Transaction[];
};
export type IndexStatsCardDefinition = {
    id: IndexStatsCardId;
    render: (ctx: IndexStatsCardRenderContext) => JSX.Element;
};

export const INDEX_STATS_CARDS: Record<IndexStatsCardId, IndexStatsCardDefinition> = {
    spend: {
        id: 'spend',
        render: ({ startDate }) => <IndexSpendAreaChart startDate={startDate} />,
    },
    activity: {
        id: 'activity',
        render: ({ startDate, transactions }) => (
            <IndexHeatmap transactions={transactions} startDate={startDate} />
        ),
    },
    netWorth: {
        id: 'netWorth',
        render: () => <IndexNetworthAreaChart />,
    },
};

// hardcoded for now in the future this should come from settings
export const DEFAULT_INDEX_STATS_CARD_ORDER: IndexStatsCardId[] = ['spend', 'activity', 'netWorth'];
