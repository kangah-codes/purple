import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { SearchIcon } from '@/components/SVG/icons/noscale';
import { InputField, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { LRUCache } from '@/lib/utils/cache';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import CustomBottomSheetFlatList from '../../molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '../../molecules/GlobalBottomSheetFlatList/hooks';

// TODO: move to a type declaration file
export type SelectOption = {
    value: string | number | boolean;
    label: string;
    searchField?: string;
};

type SearchableSelectFieldProps = {
    label?: string;
    options: {
        [key: string]: SelectOption;
    };
    selectKey: string;
    customSnapPoints?: (number | string)[];
    renderItem?: (item: SelectOption) => React.ReactNode;
    renderSelectedItem?: (item: SelectOption) => React.ReactNode;
    onChange?: (value: string) => void;
    value?: string;
    useCache?: boolean;
};

export default function SearchableSelectField({
    label,
    options,
    selectKey,
    customSnapPoints,
    renderItem,
    renderSelectedItem,
    onChange,
    value,
    useCache = false,
}: SearchableSelectFieldProps) {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const selectCache = new LRUCache<SelectOption>(selectKey, 3);
    const [searchValue, setSearchValue] = useState<string>('');
    const [val, setValue] = useState<string | undefined>(value);
    const renderDefaultItem = useCallback(
        (item: any) => (
            <View className='py-3 border-b border-purple-200'>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-gray-800'>
                    {item.label}
                </Text>
            </View>
        ),
        [],
    );
    const renderDefaultSelectedItem = useCallback(
        (label: string) => (
            <Text style={satoshiFont.satoshiMedium} className='text-xs text-gray-900'>
                {truncateStringIfLongerThan(label, 45)}
            </Text>
        ),
        [],
    );
    const filteredData = useMemo(() => {
        return Object.keys(options)
            .map((key) => options[key])
            .filter((item) => {
                return (item.searchField ? item.searchField : item.label)
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
            });
    }, [searchValue, options]);

    return (
        <>
            {/**
             * //TODO: only render this if the bottom list is showing
             */}
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={customSnapPoints ?? ['50%', '50%']}
                    children={
                        <View className='flex flex-col space-y-2.5'>
                            {label && (
                                <View className='px-5 py-1'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-base text-black'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}

                            <View className='w-full px-5 pb-2.5'>
                                <View className='relative flex justify-center mt-5'>
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 pl-10 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={satoshiFont.satoshiMedium}
                                        placeholder='Search'
                                        cursorColor={'#000'}
                                        onChangeText={setSearchValue}
                                        value={searchValue}
                                    />
                                    <SearchIcon
                                        width={16}
                                        height={16}
                                        style={styles.searchIcon}
                                        stroke='#A855F7'
                                    />
                                </View>
                            </View>

                            {selectCache.size() > 0 && useCache && (
                                <View className='w-full px-5 flex flex-col bg-white'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-base text-black'
                                    >
                                        Recently Used
                                    </Text>
                                    {selectCache.getAllItems().map(([key, item]) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setValue(item.value.toString());
                                                onChange && onChange(item.value.toString());
                                                useCache &&
                                                    selectCache.set(item.value.toString(), item);
                                                // close the bottom sheet
                                                setShowBottomSheetFlatList(selectKey, false);
                                            }}
                                        >
                                            {renderItem
                                                ? renderItem(item)
                                                : renderDefaultItem(item)}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    }
                    sheetKey={selectKey}
                    // data={Object.keys(options).map((key) => options[key]) ?? []}
                    data={filteredData}
                    renderItem={(item) => {
                        let _item = item.item as unknown as SelectOption;
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setValue(_item.value.toString());
                                    onChange && onChange(_item.value.toString());
                                    // close the bottom sheet
                                    setShowBottomSheetFlatList(selectKey, false);
                                    selectCache.set(_item.value.toString(), _item);
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
                    }}
                />
            </Portal>

            <View className='flex flex-col space-y-1'>
                {label && (
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
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

                    <View>
                        {renderSelectedItem
                            ? renderSelectedItem(options[val ?? ''])
                            : renderDefaultSelectedItem(
                                  options[val ?? '']?.label ?? `Select an option...`,
                              )}
                    </View>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
    shadow: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 48,
        elevation: 10,
        // marginBottom: 10,
    },
});
