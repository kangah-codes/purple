import { GenericAPIResponse } from '@/@types/request';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UseMutationResult, useMutation } from 'react-query';
import { SessionData } from './schema';
import { nativeStorage } from '@/lib/utils/storage';
import { useUserStore } from '../Profile/hooks';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSignIn = (): UseMutationResult<GenericAPIResponse<SessionData>, Error> => {
    return useMutation(['sign-in'], async (loginInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
            },
            body: JSON.stringify(loginInformation),
        });

        if (!res.ok) {
            const errorResponse = await res.json();
            throw new Error(errorResponse.message || 'Login failed');
        }

        const json = await res.json();
        return json;
    });
};

export const useSignUp = (): UseMutationResult<GenericAPIResponse<SessionData>, Error> => {
    return useMutation(['sign-up'], async (signUpInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/sign-up`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signUpInformation),
        });

        if (!res.ok) {
            const errorResponse = await res.json();
            throw new Error(errorResponse.message || 'An error occured');
        }

        const json = await res.json();
        return json;
    });
};

export const useCheckUsername = (): UseMutationResult<GenericAPIResponse<any>, Error> => {
    return useMutation(['check-username'], async (data) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/check-username`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorResponse = await res.json();
            throw new Error(errorResponse.message || 'An error occured');
        }

        const json = await res.json();
        return json;
    });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
    const [refreshExpiry, setRefreshExpiry] = useState<Date | null>(null);
    const [isSetting, setIsSetting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [sessionData, _setSessionData] = useState<SessionData | null>(null);
    const [hasOnboarded, setHasOnboarded] = useState(false);
    const { reset: resetUser } = useUserStore();

    const getToken = useCallback(async <T = any,>(key: string): Promise<T | null> => {
        try {
            const data = await SecureStore.getItemAsync(key);

            if (!data) return null;

            return JSON.parse(data) as T;
        } catch (err) {
            console.error(`Error retrieving ${key}:`, err);
            throw err;
        }
    }, []);

    const isTokenExpired = useCallback((expiryDate: string | null): boolean => {
        if (!expiryDate) return true;
        return new Date(expiryDate) <= new Date();
    }, []);

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        try {
            const sessionData = await getToken<SessionData>('session_data');
            const isSessionValid =
                sessionData?.access_token && !isTokenExpired(sessionData.access_token_expires_at);
            const isRefreshValid =
                sessionData?.refresh_token && !isTokenExpired(sessionData.refresh_token_expires_at);

            setIsAuthenticated(!!(isSessionValid && isRefreshValid && sessionData));
            setSessionExpiry(
                sessionData?.access_token_expires_at
                    ? new Date(sessionData.access_token_expires_at)
                    : null,
            );
            setRefreshExpiry(
                sessionData?.refresh_token_expires_at
                    ? new Date(sessionData.refresh_token_expires_at)
                    : null,
            );
            _setSessionData(sessionData);

            const onboarded = await getToken<boolean>('has_onboarded');
            setHasOnboarded(!!onboarded);
        } catch (err) {
            console.error('Error checking authentication:', err);
            setIsAuthenticated(false);
            setHasOnboarded(false);
            setSessionExpiry(null);
            setRefreshExpiry(null);
            _setSessionData(null);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, isTokenExpired]);

    const setSessionData = useCallback(
        async (sessionData: SessionData) => {
            setIsSetting(true);
            setError(null);

            try {
                await SecureStore.setItemAsync('session_data', JSON.stringify(sessionData));
                await checkAuth();
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            } finally {
                setIsSetting(false);
            }
        },
        [checkAuth],
    );

    const setOnboarded = useCallback(async (onboarded: boolean) => {
        try {
            await SecureStore.setItemAsync('has_onboarded', JSON.stringify(onboarded));
            setHasOnboarded(onboarded);
        } catch (err) {
            console.error('Error setting onboarded flag:', err);
            throw err;
        }
    }, []);

    const destroySession = useCallback(async () => {
        setIsLoading(true);
        try {
            await SecureStore.deleteItemAsync('session_data');
            await nativeStorage.multiRemove([
                'account-store',
                'plan-store',
                'transaction-store',
                'user-store',
            ]);
            resetUser();
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
