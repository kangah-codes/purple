import { useAccounts } from '@/components/Accounts/hooks';
import { Account } from '@/components/Accounts/schema';
import { usePreferences } from '@/components/Settings/hooks';
import { View } from '@/components/Shared/styled';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleProp, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AccountCard from './AccountCard';

const styles = {
    sliderWidth: Dimensions.get('window').width - 40,
    itemWidth: Dimensions.get('window').width - 40,
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
};

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

    useRefreshOnFocus(refetch);

    return (
        <View className='px-5'>
            {/** @ts-ignore */}
            <Carousel
                data={accounts?.data ?? []}
                renderItem={renderItem}
                sliderWidth={styles.sliderWidth}
                itemWidth={styles.itemWidth}
                layout={'default'}
                autoplay={false}
                style={styles.carouselStyle as StyleProp<ViewStyle>}
                onSnapToItem={setActiveSlide}
                loop
                firstItem={pinnedIndex === -1 ? undefined : pinnedIndex}
            />

            {/** @ts-ignore */}
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
