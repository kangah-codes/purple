import { useAccountStore } from '@/components/Accounts/hooks';
import { Account } from '@/components/Accounts/schema';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleProp, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AlternateAccountCard from './AlternateAccountCard';
import { View } from '@/components/Shared/styled';
import { usePreferences } from '@/components/Settings/hooks';

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
        marginHorizontal: -5, //
    },
    containerStyle: {
        paddingTop: 20,
        paddingBottom: 0,
        paddingHorizontal: 0,
    },
};

export default function AccountCardCarousel() {
    const { accounts } = useAccountStore();
    const { preferences } = usePreferences();
    const [activeSlide, setActiveSlide] = useState(0); // active slide is 0 by default
    const pinnedIndex = useMemo(() => {
        return accounts.findIndex((account) => account.id === preferences.pinnedAccount);
    }, [accounts, preferences?.pinnedAccount]);
    const renderItem = useCallback(
        (item: { index: number; item: Account }) => (
            <AlternateAccountCard item={item.item} pinnedAccount={preferences.pinnedAccount} />
        ),
        [accounts, pinnedIndex],
    );

    return (
        <View className='px-5'>
            {/** @ts-ignore */}
            <Carousel
                data={accounts}
                renderItem={renderItem}
                sliderWidth={styles.sliderWidth}
                itemWidth={styles.itemWidth}
                layout={'default'}
                autoplay={false}
                style={styles.carouselStyle as StyleProp<ViewStyle>}
                onSnapToItem={setActiveSlide}
                loop
                firstItem={pinnedIndex >= 0 ? pinnedIndex : 0}
            />

            {/** @ts-ignore */}
            <Pagination
                dotsLength={accounts.length}
                activeDotIndex={activeSlide}
                dotStyle={styles.paginationDotStyle}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
                containerStyle={styles.containerStyle}
            />
        </View>
    );
}
