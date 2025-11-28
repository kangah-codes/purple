/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { Portal } from '@gorhom/portal';
import React, { useCallback } from 'react';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { useCreateNewPlanStore } from '../../hooks';

type SelectOption = {
    value: string | number | boolean;
    label: string;
};

type SelectPlanCategoryProps = {
    options: {
        [key: string]: SelectOption;
    };
    selectKey: string;
    customSnapPoints?: (number | string)[];
};

export default function SelectPlanCategory({
    options,
    selectKey,
    customSnapPoints,
}: SelectPlanCategoryProps) {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { addCategory } = useCreateNewPlanStore();
    const renderDefaultItem = useCallback(
        (item: any) => (
            <View className='py-3 border-b border-purple-100 flex flex-row justify-between'>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-gray-800'>
                    {item.label}
                </Text>
            </View>
        ),
        [],
    );

    return (
        <>
            {/**
             * //TODO: only render this if the bottom list is showing
             */}
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={customSnapPoints ?? ['50%', '50%']}
                    children={null}
                    sheetKey={selectKey}
                    data={Object.keys(options).reduce(
                        (acc, key) => [...acc, options[key]],
                        [] as SelectOption[],
                    )}
                    renderItem={(item) => {
                        const _item = item.item as unknown as SelectOption;
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setShowBottomSheetFlatList(selectKey, false);
                                    addCategory({
                                        category: _item.value as string,
                                        allocation: 0,
                                    });
                                }}
                            >
                                {renderDefaultItem(_item)}
                            </TouchableOpacity>
                        );
                    }}
                    containerStyle={{
                        paddingHorizontal: 20,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#D4D4D4',
                    }}
                    flatListContentContainerStyle={{
                        paddingBottom: 100,
                        paddingHorizontal: 20,
                        // paddingTop: 20,
                        backgroundColor: 'white',
                        // grid
                    }}
                />
            </Portal>
        </>
    );
}
