import { useAccounts } from '@/components/Accounts/hooks';
import { Account } from '@/components/Accounts/schema';
import { usePreferences } from '@/components/Settings/hooks';
import { View } from '@/components/Shared/styled';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AccountCard from './AccountCard';

export default function AccountCardCarousel({ onLoaded }: { onLoaded: () => void }) {
    const { data: accounts, refetch } = useAccounts({
        requestQuery: {},
        options: {
            onSettled: () => {
                onLoaded();
            },
        },
    });
    const { preferences } = usePreferences();
    const [activeSlide, setActiveSlide] = useState(0);
    const pinnedIndex = useMemo(() => {
        return accounts?.data.findIndex((account) => account.id === preferences.pinnedAccount);
    }, [accounts?.data, preferences?.pinnedAccount]);
    const renderItem = useCallback(
        (item: { index: number; item: Account }) => (
            <AccountCard item={item.item} pinnedAccount={preferences.pinnedAccount} />
        ),
        [accounts, pinnedIndex],
    );
    const reorderedAccounts = useMemo(() => {
        if (!accounts?.data || pinnedIndex === -1 || !pinnedIndex) return accounts?.data || [];
        const pinnedAccount = accounts.data[pinnedIndex];
        const otherAccounts = accounts.data.filter((_, index) => index !== pinnedIndex);
        return [pinnedAccount, ...otherAccounts];
    }, [accounts?.data, pinnedIndex]);

    useRefreshOnFocus(refetch);

    return (
        <View className='bg-purple-50 p-5 border border-purple-100 rounded-3xl'>
            <Carousel
                data={reorderedAccounts}
                renderItem={renderItem}
                sliderWidth={styles.slider.width}
                itemWidth={styles.item.width}
                layout={'default'}
                autoplay={false}
                style={styles.carouselStyle as StyleProp<ViewStyle>}
                onSnapToItem={setActiveSlide}
                loop
            />
            <Pagination
                dotsLength={accounts?.total_items ?? 1}
                activeDotIndex={activeSlide}
                dotStyle={styles.paginationDotStyle}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
                containerStyle={styles.containerStyle}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    slider: { width: Dimensions.get('window').width - 80 },
    item: { width: Dimensions.get('window').width - 80 },
    carouselStyle: {
        width: '100%',
    },
    paginationDotStyle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9333EA',
        marginHorizontal: -5,
    },
    containerStyle: {
        paddingTop: 20,
        paddingBottom: 0,
        paddingHorizontal: 0,
    },
    shadow: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
