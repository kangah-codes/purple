import { PaceTone, PaceCopyVariant } from './schema';

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const BUDGET_PACE_COPY: Record<PaceTone, PaceCopyVariant[]> = {
    negative: [
        {
            title: '🚦 Spending is picking up speed',
            message: ({ overCount, categoryCount }) =>
                overCount > 0
                    ? `⚠️ ${overCount} of ${categoryCount} categories are moving faster than planned. A small slowdown now can make the rest of the month easier.`
                    : '⚠️ You’re spending faster than your monthly pace. Catching this early gives you time to adjust.',
        },
        {
            title: '🔴 Lets slow down a bit...',
            message: ({ overCount }) =>
                overCount > 0
                    ? `${overCount} categories are outpacing their budgets. You might want to rein things in before it compounds.`
                    : 'Your spending is ahead of schedule this month. A few mindful choices could bring things back on track.',
        },
        {
            title: '📈 Spending ahead of plan',
            message: () =>
                'Your expenses are climbing faster than expected for this point in the month. Consider easing off where you can.',
        },
        {
            title: '⏳ Budget drifting off pace',
            message: ({ overCount }) =>
                overCount > 0
                    ? `${overCount} categories are spending faster than expected. A small reset now could make the rest of the month smoother.`
                    : 'Your spending is starting to outpace the plan. Slowing down slightly now can prevent pressure later.',
        },
        {
            title: '🚨 A little ahead of schedule',
            message: () =>
                'Expenses are coming in faster than planned for this point in the month. This might be a good moment to pause and reassess.',
        },
        {
            title: '🧭 Time to course-correct',
            message: ({ overCount, categoryCount }) =>
                overCount > 0
                    ? `${overCount} of ${categoryCount} categories are running ahead. A few small adjustments could bring things back into balance.`
                    : 'You’re spending faster than your monthly rhythm. A quick check-in now can help steady the pace.',
        },
    ],

    positive: [
        {
            title: '🟢 Great pacing so far',
            message: () =>
                'You’re spending more slowly than expected. Nice work — you’ve built yourself some flexibility for later.',
        },
        {
            title: '💚 Ahead in a good way',
            message: () =>
                'You’re under your budget pace right now. This gives you room to breathe if something unexpected comes up.',
        },
        {
            title: '✨ Strong control',
            message: () =>
                'Your spending is well below the expected pace for this point in the month. Keep this momentum going.',
        },
        {
            title: '🌱 Building a buffer',
            message: () =>
                'You’re spending below the expected pace. That extra margin can really help later in the month.',
        },
        {
            title: '🙌 Nicely under control',
            message: () =>
                'Your spending is comfortably below the budget pace right now. Keep this steady approach going.',
        },
        {
            title: '🛡️ Cushion unlocked',
            message: () =>
                'You’ve created some financial breathing room this month by staying under pace. That’s a strong position to be in.',
        },
    ],

    neutral: [
        {
            title: '🟡 Right on pace',
            message: ({ overCount }) =>
                overCount > 0
                    ? `${overCount} categories are a bit ahead, but overall your budget is holding steady.`
                    : 'Your spending is lining up nicely with your plan.',
        },
        {
            title: '⚖️ Steady and balanced',
            message: () =>
                'You’re tracking closely to your budget pace. No major adjustments needed right now.',
        },
        {
            title: '📊 On track',
            message: ({ overCount }) =>
                overCount > 0
                    ? 'A few categories are running hot, but overall things are still under control.'
                    : 'Spending is aligned with where you expected to be this month.',
        },
        {
            title: '🎯 Tracking as planned',
            message: () =>
                'Your spending is landing right where it should be for this point in the month.',
        },
        {
            title: '🧩 Everything adds up',
            message: ({ overCount }) =>
                overCount > 0
                    ? 'A couple of categories are ahead, but nothing looks off overall.'
                    : 'Your expenses are lining up neatly with your budget plan.',
        },
        {
            title: '📍 Holding the line',
            message: () =>
                'You’re staying very close to your intended pace. No action needed — just keep an eye on things.',
        },
    ],
};
