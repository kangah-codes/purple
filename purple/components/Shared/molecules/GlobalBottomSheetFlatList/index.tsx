import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import React, {
    ComponentType,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ListRenderItem, Platform, StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useBottomSheetFlatListStore } from './hooks';
import { keyExtractor } from '@/lib/utils/number';
import EmptyList from '../ListStates/Empty';
import { View } from '../../styled';

interface CustomBottomSheetFlatListProps<T> extends BottomSheetProps {
    sheetKey: string;
    data: T[];
    renderItem: ListRenderItem<T> | null | undefined;
    flatListContentContainerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
    children: React.ReactNode;
    itemSeparator?:
        | ComponentType<any>
        | SharedValue<ComponentType<any> | null | undefined>
        | null
        | undefined;
}

function CustomBottomSheetFlatList<T>({
    sheetKey,
    data,
    renderItem,
    flatListContentContainerStyle,
    children,
    itemSeparator,
    ...rest
}: CustomBottomSheetFlatListProps<T>) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Local state to handle delayed unmounting
    const [shouldRender, setShouldRender] = useState(false);

    // Memoize default snap points
    const defaultSnapPoints = useMemo(() => rest.snapPoints || ['50%', '50%'], [rest.snapPoints]);

    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys, createBottomSheetFlatList } =
        useBottomSheetFlatListStore();

    // Extract the visibility for this specific sheet
    const isVisible = useMemo(
        () => !!bottomSheetFlatListKeys[sheetKey],
        [bottomSheetFlatListKeys, sheetKey],
    );

    // Handle delayed mounting/unmounting for smooth animations
    useEffect(() => {
        if (isVisible) {
            // Clear any pending unmount
            if (unmountTimeoutRef.current) {
                clearTimeout(unmountTimeoutRef.current);
                unmountTimeoutRef.current = null;
            }
            // Mount immediately
            setShouldRender(true);
        } else if (shouldRender) {
            // Start unmount delay to allow close animation to finish
            unmountTimeoutRef.current = setTimeout(() => {
                setShouldRender(false);
                unmountTimeoutRef.current = null;
            }, 300); // Adjust timing based on your animation duration
        }

        return () => {
            if (unmountTimeoutRef.current) {
                clearTimeout(unmountTimeoutRef.current);
            }
        };
    }, [isVisible, shouldRender]);

    // Memoize handlers
    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === -1 && bottomSheetFlatListKeys[sheetKey]) {
                setShowBottomSheetFlatList(sheetKey, false);
            }
        },
        [sheetKey, setShowBottomSheetFlatList, bottomSheetFlatListKeys],
    );

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                onPress={() => {
                    bottomSheetRef.current?.close();
                }}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        [],
    );

    // Memoize empty list component
    const EmptyListComponent = useMemo(
        () => (
            <View className='pt-10'>
                <EmptyList message="Couldn't find what you're looking for!" />
            </View>
        ),
        [],
    );

    // Initialize sheet key once
    useEffect(() => {
        createBottomSheetFlatList(sheetKey);
    }, [sheetKey, createBottomSheetFlatList]);

    // Handle sheet state changes
    useEffect(() => {
        if (shouldRender) {
            if (isVisible) {
                bottomSheetRef.current?.snapToIndex(0);
            } else {
                bottomSheetRef.current?.close();
            }
        }
    }, [isVisible, shouldRender]);

    if (!shouldRender) return null;

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
            android_keyboardInputMode='adjustResize'
            keyboardBlurBehavior='restore'
            ref={bottomSheetRef}
            index={isVisible ? 0 : -1}
            snapPoints={defaultSnapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            {...rest}
        >
            {children}
            <BottomSheetFlatList
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={flatListContentContainerStyle}
                showsVerticalScrollIndicator
                ItemSeparatorComponent={itemSeparator}
                ListEmptyComponent={EmptyListComponent}
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={10}
                windowSize={10}
                updateCellsBatchingPeriod={50}
            />
        </BottomSheet>
    );
}

export default memo(CustomBottomSheetFlatList);
