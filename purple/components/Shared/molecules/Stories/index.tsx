import React, { forwardRef, ReactNode, useImperativeHandle } from 'react';
import {
    Animated,
    StatusBar as RNStatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    ViewStyle,
} from 'react-native';
import { View } from '../../styled';

export interface StoriesProps {
    pages: ReactNode[];
    timePerPage?: number;
    autoPlay?: boolean;
    enableNavigation?: boolean;
    disableAutomaticScroll?: boolean;
    onPageChange?: (pageIndex: number) => void;
    style?: ViewStyle;
}

export interface StoriesRef {
    goToPage: (index: number) => void;
    currentIndex: number;
    goForward: () => void;
    goBack: () => void;
}

const Stories = forwardRef<StoriesRef, StoriesProps>(
    (
        {
            pages = [],
            timePerPage = 5000,
            autoPlay = true,
            enableNavigation = true,
            disableAutomaticScroll = false,
            onPageChange = () => {},
            style,
        },
        ref,
    ) => {
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [previousIndex, setPreviousIndex] = React.useState<number | null>(null);
        const [isPaused, setIsPaused] = React.useState(false);
        const [isFirstRender, setIsFirstRender] = React.useState(true);
        const progressAnimation = React.useRef(new Animated.Value(0)).current;
        const fadeOutAnimation = React.useRef(new Animated.Value(1)).current;
        const fadeInAnimation = React.useRef(new Animated.Value(1)).current;
        const isAnimating = React.useRef(false);

        React.useEffect(() => {
            setIsFirstRender(false);
        }, []);

        const resetAndStartProgressAnimation = React.useCallback(() => {
            if (disableAutomaticScroll) return;

            progressAnimation.setValue(0);

            Animated.timing(progressAnimation, {
                toValue: 1,
                duration: timePerPage,
                useNativeDriver: false,
            }).start(({ finished }) => {
                if (finished && currentIndex < pages.length - 1) {
                    animatePageTransition(currentIndex + 1);
                }
            });
        }, [currentIndex, timePerPage, pages.length, disableAutomaticScroll]);

        const animatePageTransition = React.useCallback(
            (newIndex: number) => {
                if (isAnimating.current) return;
                isAnimating.current = true;

                progressAnimation.stopAnimation();
                progressAnimation.setValue(0);

                setPreviousIndex(currentIndex);
                setCurrentIndex(newIndex);

                fadeOutAnimation.setValue(1);
                fadeInAnimation.setValue(0);

                Animated.sequence([
                    Animated.timing(fadeOutAnimation, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeInAnimation, {
                        toValue: 1, // Only start progress animation after fade transition is complete

                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setPreviousIndex(null);
                    isAnimating.current = false;
                    onPageChange(newIndex);

                    if (autoPlay && !isPaused) {
                        resetAndStartProgressAnimation();
                    }
                });
            },
            [
                currentIndex,
                fadeOutAnimation,
                fadeInAnimation,
                onPageChange,
                autoPlay,
                isPaused,
                resetAndStartProgressAnimation,
            ],
        );

        useImperativeHandle(ref, () => ({
            goToPage: (pageIndex: number) => {
                if (pageIndex >= 0 && pageIndex < pages.length) {
                    animatePageTransition(pageIndex);
                }
            },
            goForward: () => {
                if (currentIndex < pages.length - 1) {
                    animatePageTransition(currentIndex + 1);
                }
            },
            goBack: () => {
                if (currentIndex > 0) {
                    animatePageTransition(currentIndex - 1);
                }
            },
            currentIndex,
        }));

        React.useEffect(() => {
            if (
                !disableAutomaticScroll &&
                previousIndex === null &&
                autoPlay &&
                !isPaused &&
                !isFirstRender
            ) {
                resetAndStartProgressAnimation();
            }
            return () => progressAnimation.stopAnimation();
        }, [disableAutomaticScroll, previousIndex, autoPlay, isPaused, isFirstRender]);

        const navigate = React.useCallback(
            (direction: number) => {
                if (!enableNavigation || isAnimating.current) return;
                const newIndex = currentIndex + direction;
                if (newIndex >= 0 && newIndex < pages.length) {
                    animatePageTransition(newIndex);
                }
            },
            [currentIndex, enableNavigation, pages.length, animatePageTransition],
        );

        const handlePressIn = React.useCallback(() => {
            if (!disableAutomaticScroll) {
                setIsPaused(true);
                progressAnimation.stopAnimation();
            }
        }, [disableAutomaticScroll]);

        const handlePressOut = React.useCallback(() => {
            if (!disableAutomaticScroll) {
                setIsPaused(false);
                resetAndStartProgressAnimation();
            }
        }, [disableAutomaticScroll, resetAndStartProgressAnimation]);

        const renderProgressBars = () => {
            return pages.map((_, idx) => (
                <View key={idx} style={styles.progressBackground} className='rounded-full'>
                    {idx < currentIndex && <View style={[styles.progressBar, { width: '100%' }]} />}
                    {idx === currentIndex && !disableAutomaticScroll && (
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    )}
                </View>
            ));
        };

        return (
            <View style={[styles.container, style]}>
                <View style={styles.progressContainer}>{renderProgressBars()}</View>
                <View style={styles.content}>
                    {previousIndex !== null && (
                        <Animated.View
                            style={[styles.pageContainer, { opacity: fadeOutAnimation }]}
                        >
                            {pages[previousIndex]}
                        </Animated.View>
                    )}
                    <Animated.View
                        style={[
                            styles.pageContainer,
                            { opacity: isFirstRender ? 1 : fadeInAnimation },
                        ]}
                    >
                        {pages[currentIndex]}
                    </Animated.View>
                </View>
                {enableNavigation && (
                    <View style={styles.navigationContainer}>
                        <TouchableWithoutFeedback
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => navigate(-1)}
                        >
                            <View style={styles.navigationHalf} />
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => navigate(1)}
                        >
                            <View style={styles.navigationHalf} />
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 20,
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 1,
        gap: 4,
        paddingTop: RNStatusBar.currentHeight,
    },
    progressBackground: {
        flex: 1,
        backgroundColor: '#F3E8FF',
        borderRadius: 1,
        overflow: 'hidden',
        height: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#A855F7',
    },
    content: {
        flex: 1,
    },
    pageContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    navigationContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    navigationHalf: {
        flex: 1,
    },
});

export default Stories;
