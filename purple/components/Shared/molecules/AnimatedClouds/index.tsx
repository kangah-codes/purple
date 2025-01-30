import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated } from 'react-native';

// Note: You'll need to import your cloud images appropriately for React Native
const CLOUD_TYPES = [
    require('@/assets/images/graphics/cloud-1.png'),
    require('@/assets/images/graphics/cloud-2.png'),
    require('@/assets/images/graphics/cloud-3.png'),
    require('@/assets/images/graphics/cloud-4.png'),
] as const;

const CLOUD_WIDTH = 300;
const COLLISION_BUFFER = 150; // Increased buffer for better spacing
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
    const cloudsRef = useRef<Cloud[]>([]);
    const lastSpawnTimeRef = useRef(Date.now());

    const effectiveHeight = useMemo(() => maxHeight - minHeight, [maxHeight, minHeight]);
    const spawnInterval = useMemo(() => (60 * 1000) / spawnRate, [spawnRate]);

    const getCloudPosition = useCallback((cloud: Cloud) => {
        // @ts-ignore
        return cloud.position._value;
    }, []);

    const wouldCollide = useCallback(
        (newCloudPos: number, newCloudTop: number, existingClouds: Cloud[]) => {
            return existingClouds.some((cloud) => {
                const cloudPos = getCloudPosition(cloud);
                const verticalOverlap = Math.abs(newCloudTop - cloud.top) < CLOUD_WIDTH / 3;
                const horizontalOverlap = Math.abs(newCloudPos - cloudPos) < COLLISION_BUFFER;
                return verticalOverlap && horizontalOverlap;
            });
        },
        [getCloudPosition],
    );

    const findSafePosition = useCallback(
        (existingClouds: Cloud[], attempts = 0): { position: number; top: number } | null => {
            if (attempts > 50) return null; // Prevent infinite recursion

            const scale = minScale + Math.random() * (maxScale - minScale);
            const effectiveCloudHeight = CLOUD_WIDTH * scale;
            const maxTop = Math.max(minHeight, maxHeight - effectiveCloudHeight);
            const top = minHeight + Math.random() * (maxTop - minHeight);

            // Try to find a position that doesn't collide
            const position = -CLOUD_WIDTH - attempts * COLLISION_BUFFER;

            if (!wouldCollide(position, top, existingClouds)) {
                return { position, top };
            }

            return findSafePosition(existingClouds, attempts + 1);
        },
        [maxHeight, maxScale, minHeight, minScale, wouldCollide],
    );

    const createCloud = useCallback(
        (existingClouds: Cloud[] = []): Cloud | null => {
            const safeSpot = findSafePosition(existingClouds);
            if (!safeSpot) return null;

            const scale = minScale + Math.random() * (maxScale - minScale);

            return {
                id: Math.random().toString(36).slice(7),
                type: Math.floor(Math.random() * CLOUD_TYPES.length),
                top: safeSpot.top,
                speed: baseSpeed * (0.8 + Math.random() * 0.4),
                scale,
                position: new Animated.Value(safeSpot.position),
                opacity: 0.3 + Math.random() * 0.3,
                width: CLOUD_WIDTH,
            };
        },
        [baseSpeed, findSafePosition, maxScale, minScale],
    );

    const animateCloud = useCallback(
        (cloud: Cloud) => {
            Animated.timing(cloud.position, {
                toValue: SCREEN_WIDTH + CLOUD_WIDTH,
                duration: BASE_DURATION / cloud.speed,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    const safeSpot = findSafePosition(cloudsRef.current);
                    if (safeSpot) {
                        cloud.position.setValue(safeSpot.position);
                        // cloud.animating = true;
                        animateCloud(cloud);
                    }
                }
            });
        },
        [findSafePosition],
    );

    useEffect(() => {
        // Initialize clouds with safe positions
        const initialClouds: Cloud[] = [];
        for (let i = 0; i < Math.floor(maxClouds / 2); i++) {
            const cloud = createCloud(initialClouds);
            if (cloud) {
                initialClouds.push(cloud);
                animateCloud(cloud);
            }
        }
        cloudsRef.current = initialClouds;

        const spawnNewClouds = () => {
            if (cloudsRef.current.length < maxClouds) {
                const newCloud = createCloud(cloudsRef.current);
                if (newCloud) {
                    cloudsRef.current.push(newCloud);
                    animateCloud(newCloud);
                }
            }
        };

        const spawnTimer = setInterval(spawnNewClouds, spawnInterval);
        return () => clearInterval(spawnTimer);
    }, [animateCloud, createCloud, maxClouds, spawnInterval]);

    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

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
        >
            {cloudsRef.current.map((cloud) => (
                <Animated.View
                    key={cloud.id}
                    style={[
                        styles.cloudContainer,
                        {
                            top: cloud.top - minHeight,
                            transform: [{ translateX: cloud.position }, { scale: cloud.scale }],
                            opacity: cloud.opacity,
                        },
                    ]}
                >
                    <Image
                        source={CLOUD_TYPES[cloud.type]}
                        style={styles.cloudImage}
                        resizeMode='contain'
                    />
                </Animated.View>
            ))}
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
        height: CLOUD_WIDTH / 3,
    },
    cloudImage: {
        width: '100%',
        height: '100%',
    },
});
