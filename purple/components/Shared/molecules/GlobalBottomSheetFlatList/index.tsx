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

// TODO: this typing is wrong - it should extend bottomflatlist
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
    ListFooterComponent?: any;
}

function CustomBottomSheetFlatList<T>({
    sheetKey,
    data,
    renderItem,
    flatListContentContainerStyle,
    children,
    itemSeparator,
    ListFooterComponent,
    ...rest
}: CustomBottomSheetFlatListProps<T>) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldRender, setShouldRender] = useState(false);

    const defaultSnapPoints = useMemo(() => rest.snapPoints || ['50%', '50%'], [rest.snapPoints]);
    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys, createBottomSheetFlatList } =
        useBottomSheetFlatListStore();
    const isVisible = useMemo(
        () => !!bottomSheetFlatListKeys[sheetKey],
        [bottomSheetFlatListKeys, sheetKey],
    );

    useEffect(() => {
        if (isVisible) {
            if (unmountTimeoutRef.current) {
                clearTimeout(unmountTimeoutRef.current);
                unmountTimeoutRef.current = null;
            }

            setShouldRender(true);
        } else if (shouldRender) {
            unmountTimeoutRef.current = setTimeout(() => {
                setShouldRender(false);
                unmountTimeoutRef.current = null;
            }, 300);
        }

        return () => {
            if (unmountTimeoutRef.current) {
                clearTimeout(unmountTimeoutRef.current);
            }
        };
    }, [isVisible, shouldRender]);

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
    const EmptyListComponent = useMemo(
        () => (
            <View className='pt-10'>
                <EmptyList message="Couldn't find what you're looking for!" />
            </View>
        ),
        [],
    );

    useEffect(() => {
        createBottomSheetFlatList(sheetKey);
    }, [sheetKey, createBottomSheetFlatList]);

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
            backgroundStyle={{ borderRadius: 28 }}
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
                ListFooterComponent={ListFooterComponent}
            />
        </BottomSheet>
    );
}

export default memo(CustomBottomSheetFlatList);
