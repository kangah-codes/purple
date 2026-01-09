import React from 'react';
import { View, Text } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';

export type BudgetSectionProps<T = any> = {
    title: string;
    rightHeaders?: string[];
    items?: T[];
    emptyMessage?: string;
    renderBody?: (items: T[]) => React.ReactNode;
};

export default function BudgetSection<T = any>({
    title,
    rightHeaders = [],
    items = [],
    emptyMessage = 'No items',
    renderBody,
}: BudgetSectionProps<T>) {
    if (items.length === 0) return null;

    return (
        <View className='flex flex-col space-y-5 mt-5'>
            <View className='flex-row justify-between items-center px-5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBold}>
                    {title}
                </Text>

                <View className='flex-row'>
                    {rightHeaders.map((h, i) => (
                        <Text
                            key={`header-${i}`}
                            className='text-xs text-purple-500 ml-8'
                            style={satoshiFont.satoshiBold}
                        >
                            {h}
                        </Text>
                    ))}
                </View>
            </View>

            {items && items.length > 0 ? (
                <View>{renderBody ? renderBody(items) : null}</View>
            ) : (
                <View className='px-5'>
                    <Text className='text-sm text-gray-500' style={satoshiFont.satoshiMedium}>
                        {emptyMessage}
                    </Text>
                </View>
            )}
        </View>
    );
}
