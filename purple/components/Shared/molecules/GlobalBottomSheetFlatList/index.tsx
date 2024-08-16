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
    const [defaultSnapPoints, setDefaultSnapPoints] = useState<
        | (string | number)[]
        | SharedValue<(string | number)[]>
        | Readonly<(string | number)[] | SharedValue<(string | number)[]>>
    >(useMemo(() => ['50%', '50%'], []));
    const { setShowBottomSheetFlatList, bottomSheetFlatListKeys, createBottomSheetFlatList } =
        useBottomSheetFlatListStore();

    useEffect(() => {
        createBottomSheetFlatList(sheetKey);

        if (rest.snapPoints) {
            setDefaultSnapPoints(rest.snapPoints);
        }
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        // if user swipes modal down, close it
        if (index === -1) setShowBottomSheetFlatList(sheetKey, false);
    }, []);

    useEffect(() => {
        if (bottomSheetFlatListKeys[sheetKey]) {
            bottomSheetRef.current?.snapToIndex(0);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [bottomSheetFlatListKeys]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                onPress={() => setShowBottomSheetFlatList(sheetKey, false)}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        [],
    );

    if (!bottomSheetFlatListKeys[sheetKey]) return null;

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
            android_keyboardInputMode='adjustResize'
            keyboardBlurBehavior='restore'
            ref={bottomSheetRef}
            index={bottomSheetFlatListKeys[sheetKey] ? 1 : -1}
            snapPoints={defaultSnapPoints}
            onChange={handleSheetChanges}
            {...rest}
        >
            {children && children}
            <BottomSheetFlatList
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={flatListContentContainerStyle}
                showsVerticalScrollIndicator
                ItemSeparatorComponent={itemSeparator}
            />
        </BottomSheet>
    );
}

export default memo(CustomBottomSheetFlatList);
