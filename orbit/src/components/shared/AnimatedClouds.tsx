'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import cloud_1 from '../../../public/graphics/cloud-1.svg';
import cloud_2 from '../../../public/graphics/cloud-2.svg';
import cloud_3 from '../../../public/graphics/cloud-3.svg';
import cloud_4 from '../../../public/graphics/cloud-4.svg';

const CLOUD_TYPES = [cloud_1, cloud_2, cloud_3, cloud_4] as const;
const CLOUD_WIDTH = 300;
const COLLISION_BUFFER = 50;
const VERTICAL_COLLISION_THRESHOLD = 50;

interface Cloud {
    readonly id: string;
    readonly type: number;
    readonly top: number;
    readonly speed: number;
    readonly scale: number;
    position: number;
    readonly opacity: number;
    readonly width: number;
}

interface AnimatedCloudsProps {
    readonly spawnRate?: number;
    readonly baseSpeed?: number;
    readonly minScale?: number;
    readonly maxScale?: number;
    readonly maxClouds?: number;
    readonly minHeight?: number;
    readonly maxHeight?: number;
    readonly className?: string;
}

export default function AnimatedClouds({
    spawnRate = 10,
    baseSpeed = 1,
    minScale = 0.6,
    maxScale = 1.2,
    maxClouds = 8,
    minHeight = 0,
    maxHeight = 400,
    className = '',
}: AnimatedCloudsProps) {
    // Use refs instead of state for better performance
    const cloudsRef = useRef<Cloud[]>([]);
    const lastSpawnTimeRef = useRef(Date.now());

    // Memoize static calculations
    const effectiveHeight = useMemo(() => maxHeight - minHeight, [maxHeight, minHeight]);
    const spawnInterval = useMemo(() => (60 * 1000) / spawnRate, [spawnRate]);

    const wouldCollide = useCallback((newCloud: Cloud, existingClouds: Cloud[]) => {
        const newCloudStart = newCloud.position;
        const newCloudEnd = newCloud.position + newCloud.width * newCloud.scale;
        const newCloudVertical = newCloud.top;

        // Early exit if no clouds to check
        if (existingClouds.length === 0) return false;

        return existingClouds.some((cloud) => {
            // Skip clouds that are far away vertically
            if (Math.abs(newCloudVertical - cloud.top) >= VERTICAL_COLLISION_THRESHOLD)
                return false;

            const cloudStart = cloud.position;
            const cloudEnd = cloud.position + cloud.width * cloud.scale;

            return (
                newCloudStart <= cloudEnd + COLLISION_BUFFER &&
                newCloudEnd >= cloudStart - COLLISION_BUFFER
            );
        });
    }, []);

    const createCloud = useCallback(
        (startPosition = -20, existingClouds: Cloud[] = [], attempts = 0): Cloud => {
            // Limit recursion depth to avoid performance issues
            if (attempts > 10) {
                startPosition -= 30; // Move further left to avoid collision area entirely
            }

            const scale = minScale + Math.random() * (maxScale - minScale);
            const effectiveCloudHeight = CLOUD_WIDTH * scale;
            const maxTop = Math.max(minHeight, maxHeight - effectiveCloudHeight);

            const newCloud: Cloud = {
                id: Math.random().toString(36).substr(2, 8), // More efficient ID generation
                type: Math.floor(Math.random() * CLOUD_TYPES.length),
                top: minHeight + Math.random() * (maxTop - minHeight),
                speed: baseSpeed * (0.8 + Math.random() * 0.4),
                scale,
                position: startPosition,
                opacity: 0.3 + Math.random() * 0.3,
                width: CLOUD_WIDTH,
            };

            // Only check collision if there are existing clouds and we haven't exceeded max attempts
            if (existingClouds.length && attempts <= 10 && wouldCollide(newCloud, existingClouds)) {
                return createCloud(startPosition - 15, existingClouds, attempts + 1);
            }

            return newCloud;
        },
        [baseSpeed, maxHeight, maxScale, minHeight, minScale, wouldCollide],
    );

    // Memoized animation function to prevent recreation on each render
    const updateCloudsCallback = useCallback(() => {
        let animationFrameId: number;
        let lastFrameTime = 0;

        const updateClouds = (timestamp: number) => {
            // Control frame rate - limit to ~60fps for performance
            if (timestamp - lastFrameTime < 16) {
                animationFrameId = requestAnimationFrame(updateClouds);
                return;
            }

            lastFrameTime = timestamp;
            const currentTime = Date.now();
            const timeSinceLastSpawn = currentTime - lastSpawnTimeRef.current;
            let shouldUpdate = false;

            // Update existing cloud positions
            const updatedClouds = cloudsRef.current.filter((cloud) => {
                cloud.position += cloud.speed / 60;
                return cloud.position < 120;
            });

            // Check if clouds array changed
            if (updatedClouds.length !== cloudsRef.current.length) {
                shouldUpdate = true;
                cloudsRef.current = updatedClouds;
            }

            // Spawn new clouds if needed
            if (
                cloudsRef.current.length < maxClouds &&
                (timeSinceLastSpawn >= spawnInterval || cloudsRef.current.length < maxClouds / 2)
            ) {
                shouldUpdate = true;
                lastSpawnTimeRef.current = currentTime;
                const cloudsNeeded = Math.min(
                    maxClouds - cloudsRef.current.length,
                    Math.max(1, Math.floor((maxClouds - cloudsRef.current.length) / 2)),
                );

                const newClouds: Cloud[] = [];
                for (let i = 0; i < cloudsNeeded; i++) {
                    newClouds.push(createCloud(-20 - i * 15, [...cloudsRef.current, ...newClouds]));
                }

                cloudsRef.current = [...cloudsRef.current, ...newClouds];
            }

            // Force re-render only when necessary
            if (shouldUpdate) {
                forceUpdate();
            }

            animationFrameId = requestAnimationFrame(updateClouds);
        };

        return {
            start: () => {
                animationFrameId = requestAnimationFrame(updateClouds);
                return animationFrameId;
            },
            stop: () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            },
        };
    }, [createCloud, maxClouds, spawnInterval]);

    useEffect(() => {
        // Initialize clouds - distribute them evenly across the container
        const initialCount = Math.floor(maxClouds / 2);
        const initialClouds: Cloud[] = [];

        for (let i = 0; i < initialCount; i++) {
            const xPos = -20 + (140 / initialCount) * i;
            initialClouds.push(createCloud(xPos, initialClouds));
        }

        cloudsRef.current = initialClouds;
        forceUpdate(); // Initial render with clouds

        // Start animation loop
        const animation = updateCloudsCallback();

        // Clean up
        return () => animation.stop();
    }, [createCloud, maxClouds, updateCloudsCallback]);

    // Use forceUpdate instead of state for better performance
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <div
            className={`fixed pointer-events-none overflow-hidden ${className}`}
            style={{
                top: minHeight,
                height: effectiveHeight,
            }}
        >
            {cloudsRef.current.map((cloud) => (
                <div
                    key={cloud.id}
                    className='absolute'
                    style={{
                        top: `${cloud.top - minHeight}px`,
                        left: `${cloud.position}%`,
                        transform: `scale(${cloud.scale})`,
                        opacity: cloud.opacity,
                        willChange: 'transform, left',
                        transition: 'transform 0.5s ease-out',
                    }}
                >
                    <div className='w-[150px] h-[150px] lg:w-[300px] lg:h-[300px]'>
                        <Image
                            src={CLOUD_TYPES[cloud.type]}
                            width={300}
                            height={100}
                            alt='Cloud'
                            priority={false}
                            loading='lazy'
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
