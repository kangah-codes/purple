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
    /** Array of React elements to be displayed as story pages */
    pages: ReactNode[];
    /** Duration (in milliseconds) to show each page before advancing. Default: 5000 */
    timePerPage?: number;
    /** Whether to automatically advance to next page. Default: true */
    autoPlay?: boolean;
    /** Whether to allow navigation by tapping. Default: true */
    enableNavigation?: boolean;
    /** Whether to disable automatic scrolling and progress animation. Default: false */
    disableAutomaticScroll?: boolean;
    /** Callback fired when page changes with new page index */
    onPageChange?: (pageIndex: number) => void;
    /** Optional style to override container */
    style?: ViewStyle;
}

export interface StoriesRef {
    goToPage: (index: number) => void;
    currentIndex: number;
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
        const [isPaused, setIsPaused] = React.useState(false);
        const progressAnimation = React.useState(new Animated.Value(0))[0];

        useImperativeHandle(ref, () => ({
            goToPage: (pageIndex: number) => {
                if (pageIndex >= 0 && pageIndex < pages.length) {
                    progressAnimation.stopAnimation();
                    setCurrentIndex(pageIndex);
                    onPageChange(pageIndex);
                }
            },
            currentIndex,
        }));

        const startProgressAnimation = React.useCallback(() => {
            if (disableAutomaticScroll) return;

            progressAnimation.setValue(0);
            if (autoPlay && !isPaused) {
                Animated.timing(progressAnimation, {
                    toValue: 1,
                    duration: timePerPage,
                    useNativeDriver: false,
                }).start(({ finished }) => {
                    if (finished && currentIndex < pages.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                        onPageChange(currentIndex + 1);
                    }
                });
            }
        }, [
            currentIndex,
            timePerPage,
            autoPlay,
            isPaused,
            pages.length,
            onPageChange,
            disableAutomaticScroll,
        ]);

        React.useEffect(() => {
            if (!disableAutomaticScroll) {
                startProgressAnimation();
            }
            return () => progressAnimation.stopAnimation();
        }, [currentIndex, isPaused, disableAutomaticScroll]);

        const navigate = React.useCallback(
            (direction: number) => {
                if (!enableNavigation) return;

                const newIndex = currentIndex + direction;
                if (newIndex >= 0 && newIndex < pages.length) {
                    progressAnimation.stopAnimation();
                    setCurrentIndex(newIndex);
                    onPageChange(newIndex);
                }
            },
            [currentIndex, enableNavigation, pages.length, onPageChange],
        );

        const handlePressIn = () => {
            if (!disableAutomaticScroll) {
                setIsPaused(true);
                progressAnimation.stopAnimation();
            }
        };

        const handlePressOut = () => {
            if (!disableAutomaticScroll) {
                setIsPaused(false);
                startProgressAnimation();
            }
        };

        return (
            <View style={[styles.container, style]}>
                <View style={styles.progressContainer}>
                    {pages.map((_, idx) => (
                        <View
                            key={idx}
                            style={styles.progressBackground}
                            className='rounded-full h-1'
                        >
                            {!disableAutomaticScroll && (
                                <Animated.View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width:
                                                idx === currentIndex
                                                    ? progressAnimation.interpolate({
                                                          inputRange: [0, 1],
                                                          outputRange: ['0%', '100%'],
                                                      })
                                                    : idx < currentIndex
                                                    ? '100%'
                                                    : '0%',
                                        },
                                    ]}
                                />
                            )}
                            {disableAutomaticScroll && (
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: idx <= currentIndex ? '100%' : '0%',
                                        },
                                    ]}
                                />
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.content}>{pages[currentIndex]}</View>

                {enableNavigation && (
                    <View style={styles.navigationContainer}>
                        <TouchableWithoutFeedback
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => {
                                navigate(-1);
                            }}
                        >
                            <View style={styles.navigationHalf} />
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => {
                                navigate(1);
                            }}
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
        // backgroundColor: 'black',
        // paddingTop: RNStatusBar.currentHeight,
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
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#A855F7',
    },
    content: {
        flex: 1,
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
