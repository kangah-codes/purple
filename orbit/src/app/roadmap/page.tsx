import RoadmapList from '@/components/roadmap/RoadmapList';
import { RoadmapItem } from '@/components/roadmap/types';
import Hero from '@/components/shared/Hero';

/**
 * ### Added: for new features.
 * ### Changed: for changes in existing functionality.
 * ### Fixed: for any bug fixes.
 * ### Deprecated: for features that will be removed in future versions.
 * ### Removed: for deprecated features that have been removed.
 * ### Security: for any security fixes or upgrades.
 */

const roadmapItems: RoadmapItem[] = [
    {
        id: 1,
        title: 'Dark Mode',
        description:
            'A sleek dark interface for late-night budgeting or reduced eye strain — switch themes effortlessly.',
        timeline: 'TBD',
        type: 'quality-of-life',
        status: 'planned',
        isPriority: true,
    },
    {
        id: 2,
        title: 'Push Notifications',
        description:
            'Stay on top of your finances with timely alerts for budget limits, bill reminders, and account activity.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 3,
        title: 'Recurring Transactions',
        description:
            'Automatically schedule repeating income and expense items like rent, subscriptions, or salary.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 4,
        title: 'Automatic Transaction Management',
        description:
            'Purple will detect patterns, suggest categories, and clean up duplicate or outdated entries for you.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 5,
        title: 'AI Integration',
        description:
            'Leverage Iris, our bset in class assistant to give you smart insights, predictive suggestions, and natural-language queries to plan and reflect on your finances.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 6,
        title: 'Online Sync & Backup',
        description:
            'Seamlessly sync your data across devices and never lose progress with secure cloud backups.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 7,
        title: 'Localization',
        description:
            'Purple will support multiple languages and regional formats — budgeting, your way.',
        timeline: 'TBD',
        type: 'quality-of-life',
        status: 'planned',
    },
    {
        id: 8,
        title: 'Cash Flow Analysis',
        description:
            'Understand how money moves through your life with detailed daily, weekly, or monthly inflow/outflow breakdowns.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 9,
        title: 'Net Worth Reporting',
        description:
            'Track your net worth over time by factoring in assets, liabilities, and savings goals.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
    {
        id: 10,
        title: 'Calendar Integration',
        description:
            'View upcoming transactions, bill due dates, and financial events directly in your calendar app.',
        timeline: 'TBD',
        type: 'new-feature',
        status: 'planned',
    },
];

export default function Roadmap() {
    return (
        <div className='flex items-center flex-col'>
            <Hero
                title='Roadmap'
                description={`Explore what's in the pipeline for Purple. Here's a curated list of planned features, enhancements, and ideas we're working on to make your budgeting and finance experience even smarter, smoother, and more powerful.`}
            />
            <RoadmapList items={roadmapItems} />
        </div>
    );
}
