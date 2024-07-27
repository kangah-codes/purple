import { View } from '@/components/Shared/styled';
import React from 'react';

export default function Pagination({ selected }: { selected: boolean }) {
    return (
        <View
            className='w-2 h-2 rounded-full mx-0.5'
            style={{
                backgroundColor: selected ? 'rgb(124,36,206)' : '#FAF5FF',
            }}
        />
    );
}
