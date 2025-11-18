import { currencies } from '@/lib/constants/currencies';
import { User } from '../Auth/schema';

export type ProfilePageLinkProps = {
    icon: React.ReactNode;
    title: string;
    link?: string;
    callback?: () => void;
    description: string;
    renderIcon?: () => React.ReactNode;
};

export type SettingsListItem = {
    icon: React.ReactNode;
    title: string;
    link?: string;
    callback?: () => void;
    description: string;
    customItem?: () => React.ReactNode;
    renderIcon?: () => React.ReactNode;
    disabled?: boolean;
    isNew?: boolean;
};

export type UserPreferenceStore = {
    currency: string;
    setPreferences: (prefs: { currency: string }) => void;
};

export type UserStore = {
    user: User | null;
    setUser: (user: User | null) => void;
    reset: () => void;
};

export type CustomTransactionType = {
    category: string;
    emoji: string;
    is_custom?: number;
};

export type UserPreferences = {
    currency: (typeof currencies)[number]['code'];
    theme: 'light' | 'dark';
    customTransactionTypes: CustomTransactionType[];
    allowOverdraw: boolean;
    pinnedAccount: string;
    hideCompletedPlans: boolean;
    trackUsageStatistics: boolean;
    sendDiagnosticData: boolean;
    allowCurrencyConversion: boolean;

    // notification preferences
    pushNotificationsEnabled: boolean;
    dailyNotificationsEnabled: boolean;

    // update preferences
    updateFrequency: 'on_app_open' | 'interval';

    // startup guide preferences
    startupGuide: {
        isCompleted: boolean;
        completedSteps: string[];
        availableSteps: StartupStep[];
    };
};

export type StartupStep = {
    id: string;
    emoji: string;
    text: string;
    isCompleted: boolean;
    isRequired: boolean;
    order: number;
    callback: () => void;
};
