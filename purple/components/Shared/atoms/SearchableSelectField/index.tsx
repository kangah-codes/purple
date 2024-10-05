import { ChevronDownIcon } from '@/components/SVG/16x16';
import { InputField, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useMemo, useState } from 'react';
import CustomBottomSheetFlatList from '../../molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '../../molecules/GlobalBottomSheetFlatList/hooks';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { SearchIcon } from '@/components/SVG/noscale';
import { StyleSheet } from 'react-native';

type SelectOption = {
    value: string | number | boolean;
    label: string;
};

type SearchableSelectFieldProps = {
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

export default function SearchableSelectField({
    label,
    options,
    selectKey,
    customSnapPoints,
    renderItem,
    onChange,
    value,
}: SearchableSelectFieldProps) {
    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys } = useBottomSheetFlatListStore();
    const [searchValue, setSearchValue] = useState<string>('');
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
    const filteredData = useMemo(() => {
        return Object.keys(options)
            .map((key) => options[key])
            .filter((item) => {
                return item.label.toLowerCase().includes(searchValue.toLowerCase());
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
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-base text-gray-900'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}

                            <View className='w-full px-5 pb-2.5'>
                                <View className='relative flex justify-center mt-5'>
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 pl-10 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={GLOBAL_STYLESHEET.interSemiBold}
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

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
});
