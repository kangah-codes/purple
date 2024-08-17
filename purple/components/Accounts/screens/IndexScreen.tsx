import {
    InputField,
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { RefreshControl, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import AccountsTotalSummary from '../molecules/AccountsTotalSummary';
import { DotsVerticalIcon } from '@/components/SVG/20x20';
import AccountsAccordion from '../molecules/AccountsAccordion';
import { router } from 'expo-router';
import { EditSquareIcon, PlusIcon } from '@/components/SVG/24x24';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function AccountsScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);
    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='px-5 flex flex-col space-y-2.5'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg mt-2.5'>
                    Accounts
                </Text>

                <View className='h-1 border-gray-100 border-b w-full mb-2.5' />

                <AccountsTotalSummary />
            </View>

            <ScrollView
                className='h-full space-y-5'
                contentContainerStyle={{
                    paddingBottom: 300,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <AccountsAccordion />
            </ScrollView>

            <LinearGradient
                className='rounded-full justify-center items-center space-y-4 absolute right-5 bottom-5'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                    onPress={handleNavigation}
                >
                    <PlusIcon stroke={'#fff'} />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
