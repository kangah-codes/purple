import { useAuth } from '@/components/Auth/hooks';
import HoldButton from '@/components/Shared/atoms/HoldButton';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';
import CustomBottomSheetModal from '../../Shared/molecules/GlobalBottomSheetModal';
import { useDeletePlan, usePlanStore } from '../hooks';

export default function PlanActionMenu() {
    const { currentPlan } = usePlanStore();
    const { id } = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { mutate, isLoading: deletePlanLoading } = useDeletePlan({
        sessionData: sessionData!,
        planID: id as string,
    });

    if (!currentPlan) return null;

    return (
        <CustomBottomSheetModal
            modalKey={'planScreenModal'}
            snapPoints={['35%', '35%']}
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
            <View className='flex flex-col p-5 space-y-10'>
                <View className='flex flex-col space-y-2.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaBlack}
                        className='text-2xl text-black text-center'
                    >
                        Delete Plan?
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaMedium}
                        className='text-sm textblack text-center'
                    >
                        Are you sure you want to delete{' '}
                        {truncateStringIfLongerThan(currentPlan.name as string, 20)}
                    </Text>
                </View>
                <View>
                    <HoldButton
                        onComplete={() =>
                            mutate(undefined, {
                                onError: () => {
                                    Toast.show({
                                        type: 'error',
                                        props: {
                                            text1: 'Error!',
                                            text2: 'There was an issue deleting plan',
                                        },
                                    });
                                },
                                onSuccess: (res) => {
                                    Toast.show({
                                        type: 'success',
                                        props: {
                                            text1: 'Success!',
                                            text2: 'Plan deleted successfully',
                                        },
                                    });
                                    router.replace('/(tabs)/plans');
                                },
                            })
                        }
                        isLoading={deletePlanLoading}
                        progressColor='#dc2626'
                        backgroundColor='#e5e7eb'
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.gramatikaBlack}
                            className='text-white text-lg'
                        >
                            Delete
                        </Text>
                    </HoldButton>
                </View>
            </View>
        </CustomBottomSheetModal>
    );
}
