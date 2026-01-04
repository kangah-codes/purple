import Checkbox from '@/components/Shared/atoms/Checkbox';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import React, { useCallback } from 'react';
import { usePreferences } from '../hooks';

type UpdateFrequencyOption = {
    id: 'on_app_open' | 'interval';
    label: string;
    description: string;
};

export default function UpdateFrequency() {
    const { setPreference, preferences } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { logEvent } = useAnalytics();

    const updateFrequencyOptions: UpdateFrequencyOption[] = [
        {
            id: 'interval',
            label: 'Daily',
            description: 'Check for updates once per day (recommended)',
        },
        {
            id: 'on_app_open',
            label: 'Every App Open',
            description: 'Check for updates on every app launch (slower startup)',
        },
    ];

    const handlePress = useCallback(
        async (item: UpdateFrequencyOption) => {
            await logEvent('settings_set', {
                setting: 'updateFrequency',
                old_value: preferences.updateFrequency,
                new_value: item.id,
            });
            setPreference('updateFrequency', item.id);
            setShowBottomSheetFlatList('preferences-update-frequency', false);
        },
        [preferences.updateFrequency, setPreference, setShowBottomSheetFlatList, logEvent],
    );

    const renderItem = useCallback(
        ({ item }: { item: UpdateFrequencyOption }) => {
            const isChecked = preferences.updateFrequency === item.id;

            return (
                <TouchableOpacity
                    onPress={() => handlePress(item)}
                    className='py-4 border-b border-purple-100 flex flex-col space-y-1'
                >
                    <View className='flex flex-row items-center justify-between'>
                        <View className='flex flex-col'>
                            <Text style={satoshiFont.satoshiBold} className='text-sm'>
                                {item.label}
                            </Text>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-xs text-purple-500'
                            >
                                {item.description}
                            </Text>
                        </View>

                        <Checkbox checked={isChecked} onChange={() => handlePress(item)} />
                    </View>
                </TouchableOpacity>
            );
        },
        [preferences.updateFrequency, handlePress],
    );

    return (
        <CustomBottomSheetFlatList
            snapPoints={['40%', '50%']}
            sheetKey={'preferences-update-frequency'}
            data={updateFrequencyOptions}
            containerStyle={{
                paddingHorizontal: 20,
            }}
            handleIndicatorStyle={{
                backgroundColor: '#D4D4D4',
            }}
            flatListContentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 20,
                backgroundColor: 'white',
            }}
            // @ts-expect-error idk
            renderItem={renderItem}
            keyExtractor={(item: UpdateFrequencyOption) => item.id}
        />
    );
}
