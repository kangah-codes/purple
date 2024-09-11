import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ErrorBoundaryProps as ExpoRouterErrorBoundaryProps } from 'expo-router';

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
                <View style={styles.container}>
                    <Text style={styles.title}>Oops! Something went wrong.</Text>
                    <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            this.setState({ hasError: false });
                            if (this.props.retry) {
                                this.props.retry();
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
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
