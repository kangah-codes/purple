import { GenericAPIResponse } from '@/@types/request';
import { nativeStorage } from '@/lib/utils/storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UseMutationResult, useMutation, useQueryClient } from 'react-query';
import { createAccountStore } from '../Accounts/state';
import { SessionData, SessionDataResponse, SignUpResponse } from './schema';
import { createPlanStore } from '../Plans/state';
import { createStatsStore } from '../Stats/state';
import { createTransactionStore } from '../Transactions/state';
import HTTPError from '@/lib/utils/error';
import { deleteSecureValue, getSecureValue, setSecureValue } from '@/lib/utils/secureStorage';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionExpiry: Date | null;
    refreshExpiry: Date | null;
    sessionData: SessionData | null;
    setSessionData: (sessionData: SessionData) => Promise<void>;
    isSetting: boolean;
    error: Error | null;
    destroySession: () => Promise<void>;
    hasOnboarded: boolean;
    setOnboarded: (onboarded: boolean) => Promise<void>;
    isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSignIn = (): UseMutationResult<GenericAPIResponse<SessionDataResponse>, Error> => {
    return useMutation(['sign-in'], async (loginInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/sign-in`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
            },
            body: JSON.stringify(loginInformation),
        });

        const statusCode = res.status;
        const json = await res.json();

        if (!res.ok) {
            throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        }

        return json;
    });
};

export const useSignUp = (): UseMutationResult<GenericAPIResponse<SignUpResponse>, Error> => {
    return useMutation(['sign-up'], async (signUpInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/sign-up`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signUpInformation),
        });

        const statusCode = res.status;
        const json = await res.json();

        if (!res.ok) {
            throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        }

        return json;
    });
};

export function useActivateAccount(): UseMutationResult<GenericAPIResponse<undefined>, Error> {
    return useMutation(['activate-account'], async (signUpInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/activate`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signUpInformation),
        });

        const statusCode = res.status;
        const json = await res.json();

        if (!res.ok) {
            throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        }

        return json;
    });
}

export const useCheckUsername = (): UseMutationResult<GenericAPIResponse<any>, Error> => {
    return useMutation(['check-username'], async (data) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/check-username`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const statusCode = res.status;
        const json = await res.json();

        if (!res.ok) {
            throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        }

        return json;
    });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
    const [refreshExpiry, setRefreshExpiry] = useState<Date | null>(null);
    const [isSetting, setIsSetting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [sessionData, _setSessionData] = useState<SessionData | null>(null);
    const [hasOnboarded, setHasOnboarded] = useState(false);
    const queryClient = useQueryClient();

    const isTokenExpired = useCallback((expiryDate: string | null): boolean => {
        if (!expiryDate) return true;
        return new Date(expiryDate) <= new Date();
    }, []);

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        try {
            const isOffline = nativeStorage.getItem<boolean>('isOfflineMode');
            const sessionData = await getSecureValue<SessionData>('session_data');
            const onboarded = await getSecureValue<boolean>('has_onboarded');
            const isSessionValid =
                sessionData?.access_token && !isTokenExpired(sessionData.access_token_expires_at);

            setHasOnboarded(!!onboarded);
            if (isOffline && onboarded) {
                setIsAuthenticated(true);
                setIsOfflineMode(true);
                setSessionExpiry(null);
                _setSessionData(null);
                return;
            }

            setIsAuthenticated(!!(isSessionValid && sessionData));
            setSessionExpiry(
                sessionData?.access_token_expires_at
                    ? new Date(sessionData.access_token_expires_at)
                    : null,
            );
            _setSessionData(sessionData);
        } catch (err) {
            console.error('Error checking authentication:', err);
            setIsAuthenticated(false);
            setHasOnboarded(false);
            setSessionExpiry(null);
            setRefreshExpiry(null);
            _setSessionData(null);
            setIsOfflineMode(false);
            nativeStorage.clear();
        } finally {
            setIsLoading(false);
        }
    }, [isTokenExpired]);

    const setSessionData = useCallback(
        async (sessionData: SessionData) => {
            setIsSetting(true);
            setError(null);

            try {
                await setSecureValue('session_data', JSON.stringify(sessionData));
                await checkAuth();
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            } finally {
                setIsSetting(false);
            }
        },
        [checkAuth],
    );

    const destroyStores = () => {
        createAccountStore.getState().reset();
        createPlanStore.getState().reset();
        createStatsStore.getState().reset();
        createTransactionStore.getState().reset();
    };

    const setOnboarded = useCallback(async (onboarded: boolean) => {
        try {
            await setSecureValue('has_onboarded', JSON.stringify(onboarded));
            setHasOnboarded(onboarded);
        } catch (err) {
            console.error('Error setting onboarded flag:', err);
            throw err;
        }
    }, []);

    const destroySession = useCallback(async () => {
        try {
            const isOffline = nativeStorage.getItem<boolean>('isOfflineMode');
            if (isOffline) {
                await deleteSecureValue('session_data');
                destroyStores();
                nativeStorage.clear();
                queryClient.clear();
                return;
            }

            const sessionData = await getSecureValue<SessionData>('session_data');
            destroyStores();
            nativeStorage.clear();
            queryClient.clear();
            await deleteSecureValue('session_data');
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/sign-out`, {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                    Authorization: sessionData?.access_token ?? '',
                },
            });

            if (!res.ok) {
                console.error("Coouldn't sign out");
            }
        } catch (err) {
            console.error('Error destroying session:', err);
        } finally {
            await checkAuth();
        }
    }, [checkAuth]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = useMemo(
        () => ({
            isAuthenticated,
            isLoading,
            sessionExpiry,
            refreshExpiry,
            setSessionData,
            isSetting,
            error,
            sessionData,
            destroySession,
            hasOnboarded,
            setOnboarded,
            isOfflineMode,
        }),
        [
            isAuthenticated,
            isLoading,
            sessionExpiry,
            refreshExpiry,
            setSessionData,
            sessionData,
            isSetting,
            error,
            destroySession,
            hasOnboarded,
            setOnboarded,
            isOfflineMode,
        ],
    );

    if (isLoading) {
        return null;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
