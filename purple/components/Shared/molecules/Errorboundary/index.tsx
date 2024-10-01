import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, LinearGradient, TouchableOpacity } from '@/components/Shared/styled';
import { ErrorBoundaryProps as ExpoRouterErrorBoundaryProps } from 'expo-router';
import { Image } from 'expo-image';
import tw from 'twrnc';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

type ErrorBoundaryProps = Partial<ExpoRouterErrorBoundaryProps> & {
    children: React.ReactNode;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className='flex flex-col space-y-5 items-center justify-center bg-white px-5 h-full'>
                    <Image
                        source={require('@/assets/images/graphics/13.png')}
                        style={tw`h-52 w-52`}
                    />
                    <View className='flex flex-col space-y-2.5'>
                        <Text
                            style={{ fontFamily: 'Suprapower' }}
                            className='text-2xl text-black text-center'
                        >
                            Oops! Something went wrong!
                        </Text>
                        <Text
                            style={{ fontFamily: 'InterMedium' }}
                            className='text-sm textblack text-center'
                        >
                            We've been alerted and are looking into this. Hang tight!
                        </Text>
                    </View>
                    <TouchableOpacity
                        className='w-full'
                        onPress={() => {
                            this.setState({ hasError: false });
                            if (this.props.retry) {
                                this.props.retry();
                            }
                        }}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-5 py-2.5 h-12'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text
                                style={{ fontFamily: 'InterBold' }}
                                className='text-base text-white tracking-tight'
                            >
                                Try again
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
