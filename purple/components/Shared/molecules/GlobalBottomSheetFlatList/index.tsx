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

    // Memoize default snap points
    const defaultSnapPoints = useMemo(() => rest.snapPoints || ['50%', '50%'], [rest.snapPoints]);

    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys, createBottomSheetFlatList } =
        useBottomSheetFlatListStore();

    // Memoize handlers
    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === -1) setShowBottomSheetFlatList(sheetKey, false);
        },
        [sheetKey, setShowBottomSheetFlatList],
    );

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                onPress={() => setShowBottomSheetFlatList(sheetKey, false)}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        [sheetKey, setShowBottomSheetFlatList],
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

    // Setup effect
    useEffect(() => {
        createBottomSheetFlatList(sheetKey);
    }, [sheetKey, createBottomSheetFlatList]);

    // Handle visibility changes
    useEffect(() => {
        const isVisible = bottomSheetFlatListKeys[sheetKey];
        if (isVisible) {
            bottomSheetRef.current?.snapToIndex(0);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [bottomSheetFlatListKeys[sheetKey]]);

    if (!bottomSheetFlatListKeys[sheetKey]) return null;

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
            android_keyboardInputMode='adjustResize'
            keyboardBlurBehavior='restore'
            ref={bottomSheetRef}
            index={1}
            snapPoints={defaultSnapPoints}
            onChange={handleSheetChanges}
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
                removeClippedSubviews={Platform.OS === 'android'} // Optimize memory usage
                maxToRenderPerBatch={10} // Optimize initial render
                windowSize={10} // Optimize scroll performance
                updateCellsBatchingPeriod={50} // Optimize update batching
            />
        </BottomSheet>
    );
}

export default memo(CustomBottomSheetFlatList);
