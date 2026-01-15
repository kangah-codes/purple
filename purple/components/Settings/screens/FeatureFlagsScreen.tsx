import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { FlaskIcon } from '@/components/SVG/icons/noscale';
import Switch from '@/components/Shared/atoms/Switch';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { FEATURE_FLAGS, FeatureFlagDefinition } from '@/lib/constants/featureFlags';
import { useFeatureFlags } from '@/lib/hooks/useFeatureFlags';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { ActivityIndicator, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import SettingsGroup from '../molecules/SettingsGroup';
import { SettingsListItem } from '../schema';

const CATEGORY_LABELS: Record<FeatureFlagDefinition['category'], string> = {
    developer: 'Developer',
    experimental: 'Experimental',
    beta: 'Beta',
};

export default function FeatureFlagsScreen() {
    const { flags, isLoading, setFlag, resetAllFlags } = useFeatureFlags();

    const handleToggle = async (name: string, value: boolean) => {
        const success = await setFlag(name as Parameters<typeof setFlag>[0], value);
        if (success) {
            Toast.show({
                type: 'success',
                props: {
                    text1: 'Feature Flag Updated',
                    text2: `${name} is now ${value ? 'enabled' : 'disabled'}`,
                },
            });
        } else {
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to update feature flag',
                },
            });
        }
    };

    const handleResetAll = async () => {
        const success = await resetAllFlags();
        if (success) {
            Toast.show({
                type: 'success',
                props: {
                    text1: 'Reset Complete',
                    text2: 'All feature flags have been reset to defaults',
                },
            });
        } else {
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to reset feature flags',
                },
            });
        }
    };

    // Group flags by category
    const groupedFlags = FEATURE_FLAGS.reduce((acc, flag) => {
        if (!acc[flag.category]) {
            acc[flag.category] = [];
        }
        acc[flag.category].push(flag);
        return acc;
    }, {} as Record<string, FeatureFlagDefinition[]>);

    // Convert grouped flags to SettingsListItem format
    const getSettingsItems = (categoryFlags: FeatureFlagDefinition[]): SettingsListItem[] => {
        return categoryFlags.map((flag) => ({
            icon: <FlaskIcon width={20} height={20} stroke='#9333ea' />,
            title: flag.label,
            description: flag.description,
            customItem: () => (
                <Switch
                    value={flags[flag.name] ?? flag.defaultEnabled}
                    onValueChange={(value) => handleToggle(flag.name, value)}
                />
            ),
        }));
    };

    if (isLoading) {
        return (
            <SafeAreaView
                className='bg-white relative h-full items-center justify-center'
                style={styles.parentView}
            >
                <ActivityIndicator size='large' color='#9333ea' />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />

            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Feature Flags
                    </Text>
                </View>
            </View>

            <ScrollView className='flex-1 px-5' contentContainerStyle={styles.contentContainer}>
                {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
                    <View key={category} className='mb-4'>
                        <SettingsGroup
                            groupName={
                                CATEGORY_LABELS[category as FeatureFlagDefinition['category']]
                            }
                            items={getSettingsItems(categoryFlags)}
                        />
                    </View>
                ))}

                {FEATURE_FLAGS.length === 0 && (
                    <View className='items-center justify-center py-10'>
                        <FlaskIcon width={48} height={48} stroke='#d1d5db' />
                        <Text
                            style={satoshiFont.satoshiMedium}
                            className='text-gray-400 mt-4 text-center'
                        >
                            No feature flags configured
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
