import { User } from '../Auth/schema';

export type ProfilePageLinkProps = {
    icon: React.ReactNode;
    title: string;
    link?: string;
    callback: () => void;
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
