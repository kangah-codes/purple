import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useEffect, useState } from 'react';
import CustomBottomSheetFlatList from '../../molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '../../molecules/GlobalBottomSheetFlatList/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import Checkbox from '../Checkbox';

type SelectOption = {
    value: string | number | boolean;
    label: string;
};

type SelectFieldProps = {
    label?: string;
    placeholder?: string;
    options: {
        [key: string]: SelectOption;
    };
    selectKey: string;
    customSnapPoints?: (number | string)[];
    renderItem?: (item: SelectOption, isSelected: boolean, onSelect: () => void) => React.ReactNode;
    renderHeader?: () => React.ReactNode;
    renderFooter?: () => React.ReactNode;
    onChange?: (value: string) => void;
    value?: string;
    disabled?: boolean;
    multiSelect?: boolean;
    showCheckbox?: boolean;
    onClose?: () => void;
};

export default function SelectField({
    label,
    placeholder = 'Select an option...',
    options,
    selectKey,
    customSnapPoints,
    renderItem,
    renderHeader,
    renderFooter,
    onChange,
    value,
    disabled = false,
    multiSelect = false,
    showCheckbox = true,
    onClose,
}: SelectFieldProps) {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const [val, setValue] = useState<string | undefined>(value);
    const [selectedValues, setSelectedValues] = useState<string[]>(
        multiSelect && value ? value.split(',') : [],
    );

    const handleSelection = useCallback(
        (selectedValue: string) => {
            if (multiSelect) {
                setSelectedValues((prev) => {
                    const isSelected = prev.includes(selectedValue);
                    const newValues = isSelected
                        ? prev.filter((v) => v !== selectedValue)
                        : [...prev, selectedValue];

                    const joinedValues = newValues.join(',');
                    setValue(joinedValues);
                    onChange?.(joinedValues);
                    return newValues;
                });
            } else {
                setValue(selectedValue);
                onChange?.(selectedValue);
                setShowBottomSheetFlatList(selectKey, false);
                onClose?.();
            }
        },
        [multiSelect, onChange, selectKey, setShowBottomSheetFlatList, onClose],
    );

    const isItemSelected = useCallback(
        (itemValue: string) => {
            return multiSelect ? selectedValues.includes(itemValue) : itemValue === val;
        },
        [multiSelect, selectedValues, val],
    );

    const renderDefaultItem = useCallback(
        (item: SelectOption) => {
            const isSelected = isItemSelected(item.value.toString());

            return (
                <View className='py-3 border-b border-purple-100 flex flex-row justify-between items-center'>
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-gray-800 flex-1'>
                        {item.label}
                    </Text>

                    {showCheckbox && (
                        <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelection(item.value.toString())}
                        />
                    )}
                </View>
            );
        },
        [isItemSelected, showCheckbox, handleSelection],
    );

    const getDisplayValue = useCallback(() => {
        if (multiSelect) {
            if (selectedValues.length === 0) return placeholder;
            if (selectedValues.length === 1) {
                return options[selectedValues[0]]?.label || placeholder;
            }
            return `${selectedValues.length} items selected`;
        }
        return options[val ?? '']?.label ?? placeholder;
    }, [multiSelect, selectedValues, val, options, placeholder]);

    const handleClose = useCallback(() => {
        setShowBottomSheetFlatList(selectKey, false);
        onClose?.();
    }, [selectKey, setShowBottomSheetFlatList, onClose]);

    useEffect(() => {
        setValue(value);
        if (multiSelect && value) {
            setSelectedValues(value.split(',').filter(Boolean));
        }
    }, [value, multiSelect]);

    return (
        <>
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={customSnapPoints ?? ['50%', '75%']}
                    children={
                        <View className='flex flex-col'>
                            {/* Custom Header */}
                            {renderHeader ? (
                                renderHeader()
                            ) : label ? (
                                <View className='px-5 py-3 border-b border-gray-100'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-base text-gray-900'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Multi-select actions */}
                            {multiSelect && (
                                <View className='px-5 py-2 border-b border-gray-100 flex-row justify-between'>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedValues([]);
                                            setValue('');
                                            onChange?.('');
                                        }}
                                    >
                                        <Text
                                            style={satoshiFont.satoshiBold}
                                            className='text-sm text-black'
                                        >
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={handleClose}>
                                        <Text
                                            className='text-sm text-purple-600'
                                            style={satoshiFont.satoshiBold}
                                        >
                                            Done ({selectedValues.length})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    }
                    sheetKey={selectKey}
                    data={Object.keys(options).reduce(
                        (acc, key) => [...acc, options[key]],
                        [] as SelectOption[],
                    )}
                    renderItem={(item) => {
                        const _item = item.item as unknown as SelectOption;
                        const isSelected = isItemSelected(_item.value.toString());

                        return (
                            <TouchableOpacity
                                onPress={() => handleSelection(_item.value.toString())}
                                disabled={disabled}
                                className={disabled ? 'opacity-50' : ''}
                            >
                                {renderItem
                                    ? renderItem(_item, isSelected, () =>
                                          handleSelection(_item.value.toString()),
                                      )
                                    : renderDefaultItem(_item)}
                            </TouchableOpacity>
                        );
                    }}
                    ListFooterComponent={renderFooter ? renderFooter() : undefined}
                    containerStyle={{
                        paddingHorizontal: 20,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#D4D4D4',
                    }}
                    flatListContentContainerStyle={{
                        paddingBottom: renderFooter ? 20 : 100,
                        paddingHorizontal: 20,
                        backgroundColor: 'white',
                    }}
                />
            </Portal>

            {/* Trigger Button */}
            <View className='flex flex-col space-y-1'>
                {label && (
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                        {label}
                    </Text>
                )}

                <TouchableOpacity
                    onPress={() => !disabled && setShowBottomSheetFlatList(selectKey, true)}
                    disabled={disabled}
                    className={`flex flex-row items-center space-x-2 rounded-full px-2 text-sm border h-12 relative ${
                        disabled
                            ? 'bg-gray-100 border-gray-200'
                            : 'bg-purple-50/80 border-purple-200'
                    }`}
                >
                    <View className='absolute right-4'>
                        <ChevronDownIcon stroke={disabled ? '#9CA3AF' : '#8B5CF6'} />
                    </View>

                    <Text
                        style={satoshiFont.satoshiMedium}
                        className={`text-xs flex-1 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}
                        numberOfLines={1}
                    >
                        {truncateStringIfLongerThan(getDisplayValue(), 45)}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
