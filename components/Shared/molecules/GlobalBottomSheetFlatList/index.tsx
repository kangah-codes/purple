import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetModalProps,
	BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Keyboard, ListRenderItem, Platform } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { useBottomSheetFlatListStore } from "./hooks";

interface CustomBottomSheetFlatListProps<T extends { id: string }>
	extends BottomSheetProps {
	children: React.ReactNode;
	sheetKey: string;
	data: T[];
	renderItem: ListRenderItem<T> | null | undefined;
}

export default function CustomBottomSheetFlatList<T>({
	children,
	sheetKey,
	data,
	renderItem,
	...rest
}: CustomBottomSheetFlatListProps<T & { id: string }>) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [defaultSnapPoints, setDefaultSnapPoints] = useState<
		| (string | number)[]
		| SharedValue<(string | number)[]>
		| Readonly<(string | number)[] | SharedValue<(string | number)[]>>
	>(useMemo(() => ["50%", "70%"], []));
	const {
		setShowBottomSheetFlatList,
		bottomSheetFlatListKeys,
		createBottomSheetFlatList,
	} = useBottomSheetFlatListStore();

	useEffect(() => {
		createBottomSheetFlatList(sheetKey);

		const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
			if (Platform.OS === "android") {
				bottomSheetRef.current?.snapToIndex(1);
			}
		});

		if (rest.snapPoints) {
			setDefaultSnapPoints(rest.snapPoints);
		}

		return () => {
			showSubscription.remove();
		};
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
		// if user swipes modal down, close it
		if (index === -1) setShowBottomSheetFlatList(sheetKey, false);
	}, []);

	useEffect(() => {
		if (bottomSheetFlatListKeys[sheetKey])
			bottomSheetRef.current?.snapToIndex(0);
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
		[]
	);

	return (
		<BottomSheet
			backdropComponent={renderBackdrop}
			keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
			android_keyboardInputMode="adjustResize"
			keyboardBlurBehavior="restore"
			ref={bottomSheetRef}
			index={bottomSheetFlatListKeys[sheetKey] ? 1 : -1}
			snapPoints={defaultSnapPoints}
			onChange={handleSheetChanges}
			{...rest}
		>
			<BottomSheetFlatList
				data={data}
				keyExtractor={(i) => i.id}
				renderItem={renderItem}
				// contentContainerStyle={styles.contentContainer}
				// contentContainerStyle={{
				// 	paddingBottom: 100,
				// 	paddingHorizontal: 20,
				// 	paddingTop: 20,
				// }}
				// {...bottomSheetFlatListProps}
			/>
		</BottomSheet>
	);
}
