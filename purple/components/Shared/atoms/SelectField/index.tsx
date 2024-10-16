import { ChevronDownIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useEffect, useState } from 'react';
import CustomBottomSheetFlatList from '../../molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '../../molecules/GlobalBottomSheetFlatList/hooks';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

type SelectOption = {
    value: string | number | boolean;
    label: string;
};

type SelectFieldProps = {
    label?: string;
    options: {
        [key: string]: SelectOption;
    };
    selectKey: string;
    customSnapPoints?: (number | string)[];
    renderItem?: (item: SelectOption) => React.ReactNode;
    onChange?: (value: string) => void;
    value?: string;
};

export default function SelectField({
    label,
    options,
    selectKey,
    customSnapPoints,
    renderItem,
    onChange,
    value,
}: SelectFieldProps) {
    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys } = useBottomSheetFlatListStore();
    const [val, setValue] = useState<string | undefined>(value);
    const renderDefaultItem = useCallback(
        (item: any) => (
            <View className='py-3 border-b border-gray-200'>
                <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-sm text-gray-800'>
                    {item.label}
                </Text>
            </View>
        ),
        [],
    );

    useEffect(() => {
        setValue(value);
    }, [value]);

    return (
        <>
            {/**
             * //TODO: only render this if the bottom list is showing
             */}
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={customSnapPoints ?? ['50%', '50%']}
                    children={
                        label && (
                            <View className='px-5 py-1'>
                                <Text
                                    style={{ fontFamily: 'Suprapower' }}
                                    className='text-base text-gray-900'
                                >
                                    {label}
                                </Text>
                            </View>
                        )
                    }
                    sheetKey={selectKey}
                    data={Object.keys(options).reduce(
                        (acc, key) => [...acc, options[key]],
                        [] as SelectOption[],
                    )}
                    renderItem={(item) => {
                        let _item = item.item as unknown as SelectOption;
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setValue(_item.value.toString());
                                    onChange && onChange(_item.value.toString());
                                    // close the bottom sheet
                                    setShowBottomSheetFlatList(selectKey, false);
                                }}
                            >
                                {renderItem ? renderItem(_item) : renderDefaultItem(_item)}
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

            <View className='flex flex-col space-y-1'>
                {label && (
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                        {label}
                    </Text>
                )}
                <TouchableOpacity
                    // onPress={handlePresentModalPress}
                    onPress={() => setShowBottomSheetFlatList(selectKey, true)}
                    className='flex flex-row items-center space-x-2 bg-purple-50/80 rounded-full px-2 text-sm border border-purple-200 h-12 relative'
                >
                    <View className='absolute right-4'>
                        <ChevronDownIcon stroke={'#8B5CF6'} />
                    </View>

                    <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-xs text-gray-900'>
                        {truncateStringIfLongerThan(
                            options[val ?? '']?.label ?? `Select an option...`,
                            45,
                        )}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
