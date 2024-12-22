import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Animated } from 'react-native';
import { TouchableOpacity, View } from '../../styled';
import tw from 'twrnc';
import * as Haptics from 'expo-haptics';

type HoldButtonProps = {
    onComplete: () => void;
    isLoading: boolean;
    children: React.ReactNode;
    duration?: number;
    progressColor?: string;
    backgroundColor?: string;
    containerStyle?: object;
    buttonStyle?: object;
    containerClassName?: string;
    buttonClassName?: string;
};

export default function HoldButton({
    onComplete,
    isLoading,
    children,
    duration = 1000,
    progressColor = '#dc2626',
    backgroundColor = '#e5e7eb',
    containerStyle = {},
    buttonStyle = {},
    containerClassName = '',
    buttonClassName = '',
}: HoldButtonProps) {
    const [buttonWidth, setButtonWidth] = useState(0);
    const [pressing, setPressing] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const holdTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
            }
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, []);

    const startProgress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); // give some haptic feedback
        setPressing(true);
        progressAnim.setValue(0);

        // Store animation reference
        animationRef.current = Animated.timing(progressAnim, {
            toValue: buttonWidth,
            duration: duration,
            useNativeDriver: false,
        });

        animationRef.current.start(({ finished }) => {
            if (finished && pressing) {
                onComplete();
            }
        });

        // Backup timeout in case animation completion fails
        holdTimeout.current = setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // some more haptic feedback nobody asked for
            onComplete();
        }, duration + 100); // Add small buffer
    };

    const endProgress = () => {
        setPressing(false);
        if (animationRef.current) {
            animationRef.current.stop();
        }
        if (holdTimeout.current) {
            clearTimeout(holdTimeout.current);
        }

        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const onLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setButtonWidth(width);
    };

    return (
        <View
            className={`w-full`}
            style={[containerStyle, containerClassName ? tw`${containerClassName}` : undefined]}
        >
            <TouchableOpacity
                onLayout={onLayout}
                onPressIn={startProgress}
                onPressOut={endProgress}
                disabled={isLoading}
                className={`relative items-center self-center justify-center px-4 w-full py-4 rounded-full overflow-hidden`}
                style={[
                    { backgroundColor },
                    buttonStyle,
                    buttonClassName ? tw`${buttonClassName}` : undefined,
                ]}
                activeOpacity={1}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        backgroundColor: progressColor,
                        width: progressAnim,
                    }}
                />
                <View className='w-full flex items-center justify-center rounded-full relative z-10'>
                    {isLoading ? <ActivityIndicator size={28} color='#fff' /> : children}
                </View>
            </TouchableOpacity>
        </View>
    );
}
