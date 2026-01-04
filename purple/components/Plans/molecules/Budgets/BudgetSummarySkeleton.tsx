import React from 'react';
import { View } from '@/components/Shared/styled';
import { SkeletonLine } from '@/components/Shared/molecules/Skeleton';
import tw from 'twrnc';

export default function BudgetSummarySkeleton() {
    return (
        <View className='px-5 py-5'>
            {/* Summary Section Skeleton */}
            <View className='bg-purple-50/25 p-5 rounded-3xl border border-purple-100 flex flex-col space-y-2.5'>
                {/* Header */}
                <View className='flex-row justify-between items-center'>
                    <SkeletonLine width={80} height={18} />
                    <SkeletonLine width={20} height={20} style={tw`rounded-full`} />
                </View>

                <View className='h-[0.5px] border-b border-purple-100 w-full' />

                {/* Income Section */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between items-center'>
                        <SkeletonLine width={60} height={14} />
                        <SkeletonLine width={100} height={12} />
                    </View>

                    {/* Progress Bar */}
                    <View className='flex flex-row items-center space-x-0.5'>
                        <SkeletonLine width='30%' height={8} style={tw`rounded-md`} />
                        <View className='flex-grow'>
                            <SkeletonLine width='100%' height={8} style={tw`rounded-md`} />
                        </View>
                    </View>

                    <View className='flex-row justify-between'>
                        <SkeletonLine width={80} height={12} />
                        <SkeletonLine width={70} height={12} />
                    </View>
                </View>

                <View className='py-2.5'>
                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                </View>

                {/* Expenses Section */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between items-center'>
                        <SkeletonLine width={70} height={14} />
                        <SkeletonLine width={90} height={12} />
                    </View>

                    {/* Progress Bar */}
                    <View className='flex flex-row items-center space-x-0.5'>
                        <SkeletonLine width='75%' height={8} style={tw`rounded-md`} />
                        <View className='flex-grow'>
                            <SkeletonLine width='100%' height={8} style={tw`rounded-md`} />
                        </View>
                    </View>

                    <View className='flex-row justify-between'>
                        <SkeletonLine width={85} height={12} />
                        <SkeletonLine width={75} height={12} />
                    </View>
                </View>

                {/* Chart Section */}
                <View className='pt-2.5'>
                    <View className='h-[0.5px] border-b border-purple-100 w-full mb-4' />
                    <SkeletonLine width='100%' height={200} style={tw`rounded-2xl`} />
                </View>
            </View>

            {/* Fixed Expenses Skeleton */}
            <View className='mt-5 bg-purple-50/25 p-5 rounded-3xl border border-purple-100'>
                <View className='flex-row justify-between items-center mb-4'>
                    <View className='flex-row items-center space-x-2'>
                        <SkeletonLine width={24} height={24} style={tw`rounded-full`} />
                        <SkeletonLine width={120} height={16} />
                    </View>
                    <SkeletonLine width={80} height={16} />
                </View>

                {/* Transaction Items */}
                {[1, 2, 3].map((item) => (
                    <View key={item} className='flex-row justify-between items-center py-3'>
                        <View className='flex-1 flex-row items-center space-x-2 mr-4'>
                            <SkeletonLine width={32} height={32} style={tw`rounded-full`} />
                            <View className='flex-1'>
                                <SkeletonLine width='60%' height={14} />
                            </View>
                        </View>
                        <SkeletonLine width={70} height={14} style={{ minWidth: 70 }} />
                    </View>
                ))}
            </View>

            {/* Flexible Expenses Skeleton */}
            <View className='mt-5 bg-purple-50/25 p-5 rounded-3xl border border-purple-100'>
                <View className='flex-row justify-between items-center mb-4'>
                    <View className='flex-row items-center space-x-2'>
                        <SkeletonLine width={24} height={24} style={tw`rounded-full`} />
                        <SkeletonLine width={140} height={16} />
                    </View>
                    <SkeletonLine width={80} height={16} />
                </View>

                {/* Transaction Items */}
                {[1, 2, 3, 4].map((item) => (
                    <View key={item} className='flex-row justify-between items-center py-3'>
                        <View className='flex-1 flex-row items-center space-x-2 mr-4'>
                            <SkeletonLine width={32} height={32} style={tw`rounded-full`} />
                            <View className='flex-1'>
                                <SkeletonLine width='70%' height={14} />
                            </View>
                        </View>
                        <SkeletonLine width={70} height={14} style={{ minWidth: 70 }} />
                    </View>
                ))}
            </View>
        </View>
    );
}
