import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Keyboard, Platform, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomSheetModalStore } from "./hooks";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

export default function CustomBottomSheetModal({
	children,
}: {
	children: React.ReactNode;
}) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ["50%", "70%"], []);
	const { showBottomSheetModal, setShowBottomSheetModal } =
		useBottomSheetModalStore();

	useEffect(() => {
		const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
			if (Platform.OS === "android") {
				bottomSheetRef.current?.snapToIndex(1);
			}
		});

		return () => {
			showSubscription.remove();
		};
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
		// if user swipes modal down, close it
		if (index === -1) setShowBottomSheetModal(false);
	}, []);

	useEffect(() => {
		if (showBottomSheetModal) bottomSheetRef.current?.present();
	}, [showBottomSheetModal]);

	const renderBackdrop = useCallback(
		(props: BottomSheetDefaultBackdropProps) => (
			<BottomSheetBackdrop
				onPress={() => setShowBottomSheetModal(false)}
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
			/>
		),
		[]
	);

	return (
		<BottomSheetModal
			style={{ flex: 1 }}
			backdropComponent={renderBackdrop}
			keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
			android_keyboardInputMode="adjustResize"
			keyboardBlurBehavior="restore"
			ref={bottomSheetRef}
			index={showBottomSheetModal ? 1 : -1}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
		>
			<View style={{ flex: 1, paddingBottom: 20 }}>{children}</View>
		</BottomSheetModal>
	);
}
