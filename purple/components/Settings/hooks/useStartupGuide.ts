import { useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { usePreferences } from '../hooks';
import { useHasAnyAccounts } from '../../Accounts/hooks';
import { useHasAnyTransactions } from '../../Transactions/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { useHasAnyBudgets } from '@/components/Plans/hooks';

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

// TODO: for some reason changing this causes issues with hooks
const defaultSteps: StartupStep[] = [
    {
        id: 'add_account',
        emoji: '🏦',
        text: 'Add an account',
        isCompleted: true, // cash account is created default
        isRequired: true,
        order: 0,
        callback: () => router.push('/accounts/new-account'),
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
        id: 'budget',
        emoji: '🎯',
        text: 'Create a budget',
        isCompleted: false,
        isRequired: true,
        order: 2,
        callback: () => router.push('/plans/new'),
    },
    {
        id: 'first_transaction',
        emoji: '💸',
        text: 'Create your first transaction',
        isCompleted: false,
        isRequired: true,
        order: 3,
        callback: () => router.push('/transactions/new'),
    },
];

export function useStartupGuide() {
    const { preferences, setPreference } = usePreferences();
    const { data: hasAnyAccounts = false, refetch: refetchAccounts } = useHasAnyAccounts();
    useRefreshOnFocus(refetchAccounts);

    const { data: hasAnyBudgets = false, refetch: refetchBudgets } = useHasAnyBudgets();
    useRefreshOnFocus(refetchBudgets);

    const { data: hasAnyTransactions = false, refetch: refetchTransactions } =
        useHasAnyTransactions();
    useRefreshOnFocus(refetchTransactions);
    const stepsBase = useMemo<StartupStep[]>(() => defaultSteps, []);

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
                    return hasAnyAccounts;
                case 'first_transaction':
                    return hasAnyTransactions;
                case 'budget':
                    return hasAnyBudgets || startupGuide.completedSteps?.includes(stepId) || false;
                default:
                    return startupGuide.completedSteps?.includes(stepId) || false;
            }
        },
        [
            preferences.customTransactionTypes,
            hasAnyAccounts,
            hasAnyTransactions,
            hasAnyBudgets,
            startupGuide.completedSteps,
        ],
    );

    const getSteps = useCallback((): StartupStep[] => {
        return stepsBase.map((step) => ({
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
