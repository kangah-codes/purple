import { UserPreferences } from '@/components/Settings/schema';

export const TRANSACTION_TYPES = [
    { key: 'debit', label: 'Expense' },
    { key: 'credit', label: 'Income' },
    { key: 'transfer', label: 'Transfer' },
];

export const EDITABLE_TRANSACTION_TYPES = [
    { key: 'debit', label: 'Expense' },
    { key: 'credit', label: 'Income' },
];

export const TRANSACTION_CATEGORY: UserPreferences['customTransactionTypes'] = [
    {
        category: 'Food',
        emoji: '🍲',
    },
    {
        category: 'Transport',
        emoji: '🚗',
    },
    {
        category: 'Rent',
        emoji: '🏠',
    },
    {
        category: 'Utilities',
        emoji: '💡',
    },
    {
        category: 'Phone',
        emoji: '📱',
    },
    {
        category: 'Internet',
        emoji: '💻',
    },
    {
        category: 'Groceries',
        emoji: '🛒',
    },
    {
        category: 'Clothing',
        emoji: '👗',
    },
    {
        category: 'Healthcare',
        emoji: '🏥',
    },
    {
        category: 'Medications',
        emoji: '💊',
    },
    {
        category: 'Education',
        emoji: '🎓',
    },
    {
        category: 'Books',
        emoji: '📚',
    },
    {
        category: 'Entertainment',
        emoji: '🎉',
    },
    {
        category: 'Movies',
        emoji: '🍿',
    },
    {
        category: 'Games',
        emoji: '🎮',
    },
    {
        category: 'Gym',
        emoji: '🏋️',
    },
    {
        category: 'Travel',
        emoji: '✈️',
    },
    {
        category: 'Vacation',
        emoji: '🏖️',
    },
    {
        category: 'Gifts',
        emoji: '🎁',
    },
    {
        category: 'Work',
        emoji: '💼',
    },
    {
        category: 'Investments',
        emoji: '📈',
    },
    {
        category: 'Credit',
        emoji: '💳',
    },
    {
        category: 'Savings',
        emoji: '🏦',
    },
    {
        category: 'Personal',
        emoji: '🚿',
    },
    {
        category: 'Pet',
        emoji: '🐾',
    },
    {
        category: 'Maintenance',
        emoji: '🛠️',
    },
    {
        category: 'Furniture',
        emoji: '🛏️',
    },
    {
        category: 'Decor',
        emoji: '🖼️',
    },
    {
        category: 'Cleaning',
        emoji: '🧹',
    },
    {
        category: 'Insurance',
        emoji: '🛡️',
    },
    {
        category: 'Security',
        emoji: '🚨',
    },
    {
        category: 'Subscriptions',
        emoji: '📦',
    },
    {
        category: 'Miscellaneous',
        emoji: '💸',
    },
    {
        category: 'Wages',
        emoji: '💰',
    },
];

export const transactionTypes = [
    '🍲 Food',
    '🚗 Transport',
    '🏠 Rent',
    '💡 Utilities',
    '📱 Phone',
    '💻 Internet',
    '🛒 Groceries',
    '👗 Clothing',
    '🏥 Healthcare',
    '💊 Medications',
    '🎓 Education',
    '📚 Books',
    '🎉 Entertainment',
    '🍿 Movies',
    '🎮 Games',
    '🏋️ Gym',
    '✈️ Travel',
    '🏖️ Vacation',
    '🎁 Gifts',
    '💼 Work',
    '📈 Investments',
    '💳 Credit Card',
    '🏦 Savings',
    '🚿 Personal Care',
    '🐾 Pet Care',
    '🛠️ Maintenance',
    '🛏️ Furniture',
    '🖼️ Decor',
    '🧹 Cleaning',
    '🛡️ Insurance',
    '🚨 Security',
    '📦 Subscriptions',
    '💸 Miscellaneous',
    '💰 Wages',
];
