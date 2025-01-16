'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import cloud_1 from '../../../public/graphics/cloud-1.svg';
import cloud_2 from '../../../public/graphics/cloud-2.svg';
import cloud_3 from '../../../public/graphics/cloud-3.svg';
import cloud_4 from '../../../public/graphics/cloud-4.svg';

const CLOUD_TYPES = [cloud_1, cloud_2, cloud_3, cloud_4];
const CLOUD_WIDTH = 300;
const COLLISION_BUFFER = 50;

interface Cloud {
    id: string;
    type: number;
    top: number;
    speed: number;
    scale: number;
    position: number;
    opacity: number;
    width: number;
}

interface AnimatedCloudsProps {
    spawnRate?: number;
    baseSpeed?: number;
    minScale?: number;
    maxScale?: number;
    maxClouds?: number;
    minHeight?: number;
    maxHeight?: number;
    className?: string;
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
    const [clouds, setClouds] = useState<Cloud[]>([]);

    const wouldCollide = useCallback((newCloud: Cloud, existingClouds: Cloud[]) => {
        const newCloudStart = newCloud.position;
        const newCloudEnd = newCloud.position + newCloud.width * newCloud.scale;
        const newCloudVertical = newCloud.top;

        return existingClouds.some((cloud) => {
            const cloudStart = cloud.position;
            const cloudEnd = cloud.position + cloud.width * cloud.scale;
            const cloudVertical = cloud.top;

            const horizontalOverlap =
                newCloudStart <= cloudEnd + COLLISION_BUFFER &&
                newCloudEnd >= cloudStart - COLLISION_BUFFER;
            const verticalOverlap = Math.abs(newCloudVertical - cloudVertical) < 50;

            return horizontalOverlap && verticalOverlap;
        });
    }, []);

    const createCloud = useCallback(
        (startPosition = -20, existingClouds: Cloud[] = []) => {
            let attempts = 0;
            let newCloud: Cloud;

            do {
                // Account for cloud height based on scale
                const effectiveCloudHeight =
                    CLOUD_WIDTH * (minScale + Math.random() * (maxScale - minScale));
                const maxTop = Math.max(minHeight, maxHeight - effectiveCloudHeight);

                newCloud = {
                    id: Math.random().toString(36).substring(7),
                    type: Math.floor(Math.random() * CLOUD_TYPES.length),
                    // Position cloud within the specified height range
                    top: minHeight + Math.random() * (maxTop - minHeight),
                    speed: baseSpeed * (0.8 + Math.random() * 0.4),
                    scale: minScale + Math.random() * (maxScale - minScale),
                    position: startPosition,
                    opacity: 0.3 + Math.random() * 0.3,
                    width: CLOUD_WIDTH,
                };
                attempts++;
            } while (wouldCollide(newCloud, existingClouds) && attempts < 10);

            return newCloud;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [baseSpeed, maxHeight, maxScale, minHeight, minScale],
    );

    useEffect(() => {
        const initialClouds: Cloud[] = [];
        const numberOfInitialClouds = Math.floor(maxClouds / 2);

        for (let i = 0; i < numberOfInitialClouds; i++) {
            const startPosition = -20 + (140 / numberOfInitialClouds) * i;
            const newCloud = createCloud(startPosition, initialClouds);
            initialClouds.push(newCloud);
        }

        setClouds(initialClouds);

        let animationFrameId: number;
        let lastSpawnTime = Date.now();

        const updateClouds = () => {
            setClouds((currentClouds) => {
                const updatedClouds = currentClouds
                    .map((cloud) => ({
                        ...cloud,
                        position: cloud.position + cloud.speed / 60,
                    }))
                    .filter((cloud) => cloud.position < 120);

                const currentTime = Date.now();
                const timeSinceLastSpawn = currentTime - lastSpawnTime;
                const spawnInterval = (60 * 1000) / spawnRate;

                if (
                    updatedClouds.length < maxClouds &&
                    (timeSinceLastSpawn >= spawnInterval || updatedClouds.length < maxClouds / 2)
                ) {
                    lastSpawnTime = currentTime;

                    const cloudsNeeded = Math.min(
                        maxClouds - updatedClouds.length,
                        Math.max(1, Math.floor((maxClouds - updatedClouds.length) / 2)),
                    );

                    const newClouds: Cloud[] = [];
                    for (let i = 0; i < cloudsNeeded; i++) {
                        const newCloud = createCloud(-20 - i * 15, [
                            ...updatedClouds,
                            ...newClouds,
                        ]);
                        newClouds.push(newCloud);
                    }

                    return [...updatedClouds, ...newClouds];
                }

                return updatedClouds;
            });

            animationFrameId = requestAnimationFrame(updateClouds);
        };

        animationFrameId = requestAnimationFrame(updateClouds);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spawnRate, baseSpeed, minScale, maxScale, maxClouds, minHeight, maxHeight]);

    return (
        <div
            className={`fixed pointer-events-none overflow-hidden ${className}`}
            style={{
                top: minHeight,
                height: maxHeight - minHeight,
            }}
        >
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className='absolute'
                    style={{
                        top: cloud.top - minHeight + 'px', // Adjust for container offset
                        left: `${cloud.position}%`,
                        transform: `scale(${cloud.scale})`,
                        opacity: cloud.opacity,
                        transition: 'transform 0.5s ease-out',
                    }}
                >
                    <div className='w-[150px] h-[150px] lg:w-[300px] lg:h-[300px]'>
                        <Image
                            src={CLOUD_TYPES[cloud.type]}
                            width={300}
                            height={100}
                            alt='Cloud'
                            priority
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
