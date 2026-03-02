import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated } from 'react-native';

const CLOUD_TYPES = [
    require('@/assets/images/graphics/cloud-1.png'),
    require('@/assets/images/graphics/cloud-2.png'),
    require('@/assets/images/graphics/cloud-3.png'),
    require('@/assets/images/graphics/cloud-4.png'),
] as const;
const CLOUD_WIDTH = 300;
const CLOUD_HEIGHT_RATIO = 0.33;
const COLLISION_BUFFER = 200;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BASE_DURATION = 50000;

interface Cloud {
    readonly id: string;
    readonly type: number;
    readonly top: number;
    readonly speed: number;
    readonly scale: number;
    readonly opacity: number;
    readonly width: number;
    position: Animated.Value;
}

interface AnimatedCloudsProps {
    readonly spawnRate?: number;
    readonly baseSpeed?: number;
    readonly minScale?: number;
    readonly maxScale?: number;
    readonly maxClouds?: number;
    readonly minHeight?: number;
    readonly maxHeight?: number;
    readonly style?: object;
}

export default function AnimatedClouds({
    spawnRate = 10,
    baseSpeed = 1,
    minScale = 0.6,
    maxScale = 1.2,
    maxClouds = 8,
    minHeight = 0,
    maxHeight = 400,
    style = {},
}: AnimatedCloudsProps) {
    const [clouds, setClouds] = useState<Cloud[]>([]);
    const cloudsRef = useRef<Cloud[]>([]);
    const animationRefs = useRef<Animated.CompositeAnimation[]>([]);
    const effectiveHeight = useMemo(() => maxHeight - minHeight, [maxHeight, minHeight]);
    const spawnInterval = useMemo(() => (60 * 1000) / spawnRate, [spawnRate]);
    const getCloudDimensions = useCallback((scale: number) => {
        return {
            width: CLOUD_WIDTH * scale,
            height: CLOUD_WIDTH * CLOUD_HEIGHT_RATIO * scale,
        };
    }, []);
    const wouldCollide = useCallback(
        (newCloud: { position: number; top: number; scale: number }, existingClouds: Cloud[]) => {
            const newDims = getCloudDimensions(newCloud.scale);

            return existingClouds.some((cloud) => {
                // @ts-ignore
                const cloudPos = cloud.position.__getValue();
                const cloudDims = getCloudDimensions(cloud.scale);

                const verticalDistance = Math.abs(newCloud.top - cloud.top);
                const horizontalDistance = Math.abs(newCloud.position - cloudPos);

                const minVerticalDistance = (newDims.height + cloudDims.height) / 2;
                const minHorizontalDistance =
                    (newDims.width + cloudDims.width) / 2 + COLLISION_BUFFER;

                return (
                    verticalDistance < minVerticalDistance &&
                    horizontalDistance < minHorizontalDistance
                );
            });
        },
        [getCloudDimensions],
    );

    const findSafePosition = useCallback(
        (existingClouds: Cloud[]): { position: number; top: number; scale: number } => {
            const scale = minScale + Math.random() * (maxScale - minScale);
            const dims = getCloudDimensions(scale);
            const maxTop = Math.max(minHeight, maxHeight - dims.height);
            const top = minHeight + Math.random() * (maxTop - minHeight);

            for (let i = 0; i < 10; i++) {
                const position = -dims.width - Math.random() * SCREEN_WIDTH * 0.5;
                const newCloud = { position, top, scale };

                if (!wouldCollide(newCloud, existingClouds)) {
                    return newCloud;
                }
            }

            return {
                position: -CLOUD_WIDTH * maxScale * 2,
                top,
                scale,
            };
        },
        [getCloudDimensions, maxHeight, maxScale, minHeight, minScale, wouldCollide],
    );

    const createCloud = useCallback(
        (existingClouds: Cloud[]): Cloud => {
            const { position, top, scale } = findSafePosition(existingClouds);

            return {
                id: Math.random().toString(36).slice(2, 10),
                type: Math.floor(Math.random() * CLOUD_TYPES.length),
                top,
                speed: baseSpeed * (0.8 + Math.random() * 0.4),
                scale,
                position: new Animated.Value(position),
                opacity: 0.3 + Math.random() * 0.3,
                width: CLOUD_WIDTH,
            };
        },
        [baseSpeed, findSafePosition],
    );

    const animateCloud = useCallback(
        (cloud: Cloud) => {
            const animation = Animated.timing(cloud.position, {
                toValue: SCREEN_WIDTH + CLOUD_WIDTH * cloud.scale,
                duration: BASE_DURATION / cloud.speed,
                useNativeDriver: true,
            });

            animation.start(({ finished }) => {
                if (finished) {
                    animationRefs.current = animationRefs.current.filter((a) => a !== animation);

                    setClouds((prevClouds) => {
                        const newClouds = prevClouds.filter((c) => c.id !== cloud.id);
                        cloudsRef.current = newClouds;

                        if (newClouds.length < maxClouds) {
                            const newCloud = createCloud(newClouds);
                            cloudsRef.current = [...newClouds, newCloud];
                            animateCloud(newCloud);
                            return [...newClouds, newCloud];
                        }

                        return newClouds;
                    });
                }
            });

            animationRefs.current.push(animation);
        },
        [createCloud, maxClouds],
    );

    useEffect(() => {
        const initialClouds: Cloud[] = [];
        const initialCount = Math.min(Math.floor(maxClouds / 2), maxClouds);

        for (let i = 0; i < initialCount; i++) {
            const cloud = createCloud(initialClouds);
            initialClouds.push(cloud);
        }

        setClouds(initialClouds);
        cloudsRef.current = initialClouds;

        initialClouds.forEach((cloud) => animateCloud(cloud));

        const spawnIntervalId = setInterval(() => {
            setClouds((prevClouds) => {
                if (prevClouds.length >= maxClouds) return prevClouds;

                const newCloud = createCloud(prevClouds);
                animateCloud(newCloud);
                return [...prevClouds, newCloud];
            });
        }, spawnInterval);

        return () => {
            clearInterval(spawnIntervalId);
            animationRefs.current.forEach((animation) => animation.stop());
            animationRefs.current = [];
        };
    }, [animateCloud, createCloud, maxClouds, spawnInterval]);

    return (
        <View
            style={[
                styles.container,
                {
                    top: minHeight,
                    height: effectiveHeight,
                },
                style,
            ]}
            pointerEvents='none'
        >
            {clouds.map((cloud) => {
                const cloudStyle = {
                    top: cloud.top - minHeight,
                    transform: [{ translateX: cloud.position }, { scale: cloud.scale }],
                    opacity: cloud.opacity,
                };

                return (
                    <Animated.View
                        key={cloud.id}
                        style={[styles.cloudContainer, cloudStyle]}
                        shouldRasterizeIOS={true}
                        renderToHardwareTextureAndroid={true}
                    >
                        <Image
                            source={CLOUD_TYPES[cloud.type]}
                            style={styles.cloudImage}
                            resizeMode='contain'
                        />
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        overflow: 'hidden',
    },
    cloudContainer: {
        position: 'absolute',
        width: CLOUD_WIDTH,
        height: CLOUD_WIDTH * CLOUD_HEIGHT_RATIO,
    },
    cloudImage: {
        width: '100%',
        height: '100%',
    },
});
