import { ChevronDownIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { isNotEmptyString, truncateStringIfLongerThan } from '@/lib/utils/string';
import { Portal } from '@gorhom/portal';
import React, { useEffect, useState } from 'react';
import CustomBottomSheetModal from '../../molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '../../molecules/GlobalBottomSheetModal/hooks';
import { satoshiFont } from '@/lib/constants/fonts';

// Props for the parent CustomModalSelectField
interface CustomModalSelectFieldProps {
    label?: string;
    children: React.ReactElement;
    sheetKey: string;
    customSnapPoints?: (number | string)[];
    value?: string;
}

export default function CustomModalSelectField({
    label,
    sheetKey,
    customSnapPoints,
    value,
    children,
}: CustomModalSelectFieldProps) {
    const [val, setValue] = useState<string | undefined>(value);
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    useEffect(() => {
        setValue(value);
    }, [value]);

    return (
        <>
            <Portal>
                <CustomBottomSheetModal
                    modalKey={sheetKey}
                    snapPoints={customSnapPoints ?? ['35%', '35%']}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 8,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 48,
                        elevation: 10,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#D4D4D4',
                    }}
                >
                    {children}
                </CustomBottomSheetModal>
            </Portal>

            <View className='flex flex-col space-y-1'>
                {label && (
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                        {label}
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => setShowBottomSheetModal(sheetKey, true)}
                    className='flex flex-row items-center space-x-2 bg-purple-50/80 rounded-full px-2 text-sm border border-purple-200 h-12 relative'
                >
                    <View className='absolute right-4'>
                        <ChevronDownIcon stroke={'#8B5CF6'} />
                    </View>

                    <Text style={satoshiFont.satoshiMedium} className='text-xs text-gray-900'>
                        {truncateStringIfLongerThan(
                            isNotEmptyString(val) ? val! : 'Select an option...',
                            45,
                        )}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
