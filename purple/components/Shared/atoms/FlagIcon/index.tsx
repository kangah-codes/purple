import { Image } from 'expo-image';
import { flagMap } from './constants';
import React from 'react';
import { currencies } from '@/lib/constants/currencies';

type FlagIconProps = {
    currency: (typeof currencies)[number];
};

export default function FlagIcon({ currency }: FlagIconProps) {
    return (
        <Image
            style={{
                width: 37,
                height: 37,
                borderRadius: 40,
            }}
            source={flagMap[currency.code.toLowerCase()]}
            contentFit='cover'
            transition={500}
        />
    );
}
