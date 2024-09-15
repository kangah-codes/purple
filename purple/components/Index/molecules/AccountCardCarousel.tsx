import { useCallback, useState } from 'react';
import { Dimensions, StyleProp, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AlternateAccountCard from './AlternateAccountCard';
import { useUserStore } from '@/components/Profile/hooks';

const data = [
    {
        accountCurrency: 'GHS',
        accountBalance: 120000,
        accountName: 'Fidelity Bank Account',
        cardBackgroundColour: '#FB923C',
        cardTintColour: '#FED7AA',
    },
    {
        accountCurrency: 'GHS',
        accountBalance: 98994329,
        accountName: 'MTN MoMo',
        cardBackgroundColour: '#FACC15',
        cardTintColour: '#FEF9C3',
    },
    {
        accountCurrency: 'GHS',
        accountBalance: 98994329,
        accountName: 'Prepaid Card',
        cardBackgroundColour: '#FACC15',
        cardTintColour: '#FEF9C3',
    },
    {
        accountCurrency: 'GHS',
        accountBalance: 98994329,
        accountName: 'MTN MoMo',
        cardBackgroundColour: '#FACC15',
        cardTintColour: '#FEF9C3',
    },
];

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
    const { user, setUser } = useUserStore();
    const [entries, setEntries] = useState(data);
    const [activeSlide, setActiveSlide] = useState(0); // active slide is 0 by default
    const renderItem = useCallback(({ item }: any) => <AlternateAccountCard item={item} />, []);

    return (
        <>
            <Carousel
                data={user?.accounts ?? []}
                renderItem={renderItem}
                sliderWidth={styles.sliderWidth}
                itemWidth={styles.itemWidth}
                layout={'default'}
                loop
                autoplay={false}
                style={styles.carouselStyle as StyleProp<ViewStyle>}
                onSnapToItem={setActiveSlide}
            />

            <Pagination
                dotsLength={user?.accounts.length ?? 1}
                activeDotIndex={activeSlide}
                dotStyle={styles.paginationDotStyle}
                inactiveDotStyle={
                    {
                        // Define styles for inactive dots here
                    }
                }
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
                containerStyle={styles.containerStyle}
            />
        </>
    );
}
