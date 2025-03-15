/** eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, JSX } from 'react';

type RainDropProps = {
    left?: number;
    right?: number;
    bottom: number;
    delay: number;
    duration: number;
    slant?: number;
};
function RainDrop({ left, right, bottom, delay, duration, slant = 0 }: RainDropProps) {
    return (
        <div
            className='drop absolute w-[15px] h-[120px] pointer-events-none animate-drop'
            style={{
                left: left ? `${left}%` : undefined,
                right: right ? `${right}%` : undefined,
                bottom: `${bottom}%`,
                animationDelay: `0.${delay}s`,
                animationDuration: `0.5${duration}s`,
                transform: `rotate(${slant}deg)`,
            }}
        >
            <Stem delay={delay} duration={duration} />
        </div>
    );
}

type StemProps = {
    delay: number;
    duration: number;
};
function Stem({ delay, duration }: StemProps) {
    return (
        <div
            className='stem w-px h-[60%] ml-[7px] bg-gradient-to-b from-purple-100 to-purple-400 animate-stem'
            style={{
                animationDelay: `0.${delay}s`,
                animationDuration: `0.5${duration}s`,
            }}
        />
    );
}

export default function AnimatedRain({ slant = 0 }) {
    const [drops, setDrops] = useState<JSX.Element[]>([]);

    useEffect(() => {
        generateDrops();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slant]);

    const generateDrops = () => {
        let increment = 0;
        const newDrops = [];
        const newBackDrops = [];

        while (increment < 100) {
            const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
            const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
            increment += randoFiver;

            const dropProps = {
                bottom: randoFiver + randoFiver - 1 + 100,
                delay: randoHundo,
                duration: randoHundo,
                slant,
            };

            newDrops.push(<RainDrop key={`front-${increment}`} left={increment} {...dropProps} />);
            newBackDrops.push(
                <RainDrop key={`back-${increment}`} right={increment} {...dropProps} />,
            );
        }

        setDrops(newDrops);
    };

    return (
        <div className={`relative overflow-hidden w-full h-full`}>
            <div className='rain front-row absolute inset-0 z-1'>{drops}</div>
        </div>
    );
}
