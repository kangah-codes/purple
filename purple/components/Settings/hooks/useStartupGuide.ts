import { useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { usePreferences } from '../hooks';
import { useAccounts } from '../../Accounts/hooks';
import { useTransactions } from '../../Transactions/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';

export type StartupStepId =
    | 'add_account'
    | 'customize_categories'
    | 'first_transaction'
    | 'saving_plan'
    | 'budget';

export type StartupStep = {
    id: StartupStepId;
    emoji: string;
    text: string;
    isCompleted: boolean;
    isRequired: boolean;
    order: number;
    callback: () => void;
};

const defaultSteps: StartupStep[] = [
    {
        id: 'add_account',
        emoji: '🏦',
        text: 'Add an account',
        isCompleted: true, // cash account is created default
        isRequired: true,
        order: 0,
        callback: () => console.log('Navigate to add account'),
    },
    {
        id: 'customize_categories',
        emoji: '🗂️',
        text: 'Customise categories',
        isCompleted: false,
        isRequired: false,
        order: 1,
        callback: () => router.push('/settings/new-transaction-category'),
    },
    {
        id: 'first_transaction',
        emoji: '💸',
        text: 'Create your first transaction',
        isCompleted: false,
        isRequired: true,
        order: 2,
        callback: () => router.push('/transactions/new'),
    },
    {
        id: 'saving_plan',
        emoji: '🎯',
        text: 'Create a saving plan',
        isCompleted: false,
        isRequired: true,
        order: 3,
        callback: () => router.push('/plans/new'),
    },
    {
        id: 'budget',
        emoji: '📊',
        text: 'Create a budget',
        isCompleted: false,
        isRequired: true,
        order: 4,
        callback: () => console.log('Navigate to create budget'),
    },
];

export function useStartupGuide() {
    const { preferences, setPreference } = usePreferences();

    const { data: accountsData, refetch: refetchAccounts } = useAccounts({ requestQuery: {} });
    const accounts = accountsData?.data || [];
    useRefreshOnFocus(refetchAccounts);

    const { data: transactionsData, refetch: refetchTransactions } = useTransactions({
        requestQuery: { page_size: 1 },
    });
    useRefreshOnFocus(refetchTransactions);
    const transactions = transactionsData?.data || [];

    const startupGuide = preferences.startupGuide || {
        isCompleted: false,
        completedSteps: [],
        availableSteps: [],
    };

    const detectCompletionFromData = useCallback(
        (stepId: StartupStepId): boolean => {
            switch (stepId) {
                case 'customize_categories':
                    return (
                        preferences.customTransactionTypes.filter((type) => type.is_custom === 1)
                            .length > 0
                    );
                case 'add_account':
                    return accounts.length > 0;
                case 'first_transaction':
                    return transactions.length > 0;
                case 'saving_plan':
                case 'budget':
                    // TODO: future implementation
                    return startupGuide.completedSteps?.includes(stepId) || false;
                default:
                    return startupGuide.completedSteps?.includes(stepId) || false;
            }
        },
        [
            preferences.customTransactionTypes.length,
            accounts.length,
            transactions.length,
            startupGuide.completedSteps,
        ],
    );

    const getSteps = useCallback((): StartupStep[] => {
        return defaultSteps.map((step) => ({
            ...step,
            isCompleted: detectCompletionFromData(step.id),
        }));
    }, [detectCompletionFromData]);

    const markStepCompleted = useCallback(
        (stepId: StartupStepId) => {
            const currentCompletedSteps = startupGuide.completedSteps || [];
            if (!currentCompletedSteps.includes(stepId)) {
                const updatedCompletedSteps = [...currentCompletedSteps, stepId];
                const steps = getSteps();
                const requiredSteps = steps.filter((s) => s.isRequired);
                const isGuideCompleted = requiredSteps.every(
                    (s) => updatedCompletedSteps.includes(s.id) || s.isCompleted,
                );

                setPreference('startupGuide', {
                    ...startupGuide,
                    isCompleted: isGuideCompleted,
                    completedSteps: updatedCompletedSteps,
                });
            }
        },
        [startupGuide, getSteps, setPreference],
    );

    const getProgress = useCallback(() => {
        const steps = getSteps();
        const completed = steps.filter((s) => s.isCompleted).length;
        const requiredSteps = steps.filter((s) => s.isRequired);
        const isCompleted = requiredSteps.every((s) => s.isCompleted);

        return {
            completed,
            total: steps.length,
            isCompleted,
            steps,
        };
    }, [getSteps]);

    useEffect(() => {
        const steps = getSteps();
        const actuallyCompletedSteps = steps
            .filter((step) => detectCompletionFromData(step.id))
            .map((step) => step.id);

        const cachedSteps = startupGuide.completedSteps || [];
        const needsSync = actuallyCompletedSteps.some((stepId) => !cachedSteps.includes(stepId));

        if (needsSync) {
            const requiredSteps = steps.filter((s) => s.isRequired);
            const isGuideCompleted = requiredSteps.every((s) =>
                actuallyCompletedSteps.includes(s.id),
            );

            setPreference('startupGuide', {
                ...startupGuide,
                isCompleted: isGuideCompleted,
                completedSteps: [...new Set([...cachedSteps, ...actuallyCompletedSteps])],
            });
        }
    }, [getSteps, detectCompletionFromData, startupGuide, setPreference]);

    const progress = getProgress();

    return {
        ...progress,
        markStepCompleted,
        shouldShowGuide: !progress.isCompleted,
    };
}
