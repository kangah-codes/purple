import { useCreateAccount } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { usePreferences } from '@/components/Settings/hooks';
import { CurrencyCode } from '@/components/Settings/molecules/ExchangeRateItem';
import SelectCurrency from '@/components/Settings/molecules/SelectCurrency';
import FlagIcon from '@/components/Shared/atoms/FlagIcon';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { Image, LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import CurrencyService from '@/lib/services/CurrencyService';
import { nativeStorage } from '@/lib/utils/storage';
import { Portal } from '@gorhom/portal';
import React from 'react';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

export default function CurrencySetup() {
    const { setOnboarded, setSessionData } = useAuth();
    const {
        preferences: { currency },
        setPreference,
    } = usePreferences();
    const { mutate } = useCreateAccount();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const defaultCurrency = currencies.find((c) => c.code === currency)!;

    async function setSession() {
        setSessionData({
            access_token: '',
            access_token_expires_at: '',
            user: {
                ID: 'offline_user',
                username: 'offline_user',
                email: 'offline_user',
            },
        });
        await setOnboarded(true);
    }

    async function handleOnboarding() {
        nativeStorage.setItem('isOfflineMode', true);
        mutate(
            {
                category: '💵 Cash',
                name: 'Cash',
                balance: 0,
                currency: currency,
                is_default_account: true,
            },
            {
                onSuccess: async () => {
                    await setSession();
                },
                onError: async (error) => {
                    // a default cash account already exists
                    if (error.statusCode == 409) await setSession();
                    Toast.show({
                        type: 'error',
                        text1: 'Something went wrong!',
                        text2: "We couldn't setup Purple for you, try again later.",
                    });
                },
            },
        );
    }

    return (
        <View className='relative'>
            <Image
                source={require('@/assets/images/graphics/gradient-2.png')}
                style={tw`rounded-3xl w-full h-full absolute`}
            />
            <Portal>
                <SelectCurrency
                    callback={(item) => {
                        setPreference('currency', item.code);
                        setShowBottomSheetFlatList('preferences-currency', false);
                        CurrencyService.getInstance().fetchExchangeRates(
                            item.code.toLowerCase() as CurrencyCode,
                        );
                    }}
                />
            </Portal>
            <View className='flex flex-col space-y-5 justify-center px-5 h-[100%] relative'>
                <Image
                    source={require('@/assets/images/graphics/19.png')}
                    className={`rounded-3xl w-[200px] h-[100px]`}
                />
                <View className='flex flex-col space-y-2.5'>
                    <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                        One more thing...
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                        Select your preferred default currency
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowBottomSheetFlatList('preferences-currency', true)}
                >
                    <View className='flex-row items-center justify-between py-4 w-full'>
                        <View className='flex-row items-start space-x-2.5'>
                            <View className='w-[40] h-[40] flex items-center justify-center'>
                                <FlagIcon currency={defaultCurrency} />
                            </View>

                            <View className='flex flex-col w-full max-w-[70%]'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-base text-black'
                                >
                                    {defaultCurrency.name} ({defaultCurrency.code})
                                </Text>
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-sm text-black'
                                >
                                    {defaultCurrency.country}
                                </Text>
                            </View>
                        </View>
                        <ChevronRightIcon stroke='#9333ea' />
                    </View>
                </TouchableOpacity>

                <View className='flex flex-row items-center justify-center space-x-5 absolute bottom-5 w-screen'>
                    <TouchableOpacity onPress={handleOnboarding}>
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-4 py-2 w-[200] h-[50]'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text style={satoshiFont.satoshiBold} className='text-base text-white'>
                                Let's go!
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
