import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { LinearGradient, SafeAreaView, ScrollView } from '@/components/Shared/styled';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { usePlan, usePlanStatus, usePlanStore } from '../hooks';
import LoadingScreen from '../molecules/LoadingScreen';
import PlanActionMenu from '../molecules/PlanActionMenu';
import PlanBuildUpChart from '../molecules/PlanBuildUpChart';
import PlanInformation from '../molecules/PlanInformation';
import PlanNavigationArea from '../molecules/PlanNavigationArea';
import PlanTransactionsList from '../molecules/PlanTransactionsList';
import { Plan } from '../schema';
import { generateSpendingTrendData } from '../utils';
import PlanAccountOverviewPieChart from '../molecules/PlanAccountOverviewPieChart';

type PlanScreenProps = {
    showBackButton?: boolean;
};

const linearGradientColours = ['#D8B4FE', '#fff'];

function PlanScreen(props: PlanScreenProps) {
    const { currentPlan, setCurrentPlan } = usePlanStore();
    const { id } = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { data, isLoading, refetch, isFetching } = usePlan({
        sessionData: sessionData as SessionData,
        planID: id as string,
        options: {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: "We couldn't fetch this plan",
                    },
                });
                router.back();
            },
        },
    });

    useEffect(() => {
        if (data) {
            // may the ts gods forgive me
            setCurrentPlan(data.data as unknown as Plan);
        }

        return () => {
            setCurrentPlan(null);
        };
    }, [data]);

    const onRefresh = useCallback(() => {
        refetch();
    }, []);

    if (isLoading || !currentPlan) return <LoadingScreen />;
    if (!currentPlan && (!isLoading || !isFetching)) return null;

    return (
        <SafeAreaView style={styles.parentView}>
            <LinearGradient colors={linearGradientColours} style={styles.linearGradient} />
            <PlanActionMenu />
            <ExpoStatusBar style='dark' />
            <ScrollView
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
            >
                <PlanNavigationArea />
                <PlanInformation />
                <PlanBuildUpChart />
                <PlanAccountOverviewPieChart />
                <PlanTransactionsList />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
        position: 'relative',
        backgroundColor: 'white',
        flex: 1,
        height: '100%',
    },
    linearGradient: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: 350,
        paddingHorizontal: 20,
        paddingTop: RNStatusBar.currentHeight,
        paddingVertical: 10,
    },
});
export default PlanScreen;
