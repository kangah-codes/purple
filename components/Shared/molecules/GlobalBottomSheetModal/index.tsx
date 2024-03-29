import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Keyboard, Platform, View } from "react-native";
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { useBottomSheetModalStore } from "./hooks";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { SharedValue } from "react-native-reanimated";

interface CustomBottomSheetModalProps extends BottomSheetModalProps {
	children: React.ReactNode;
	modalKey: string;
}

const CustomBottomSheetModal = ({
	children,
	modalKey,
	...rest
}: CustomBottomSheetModalProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [defaultSnapPoints, setDefaultSnapPoints] = useState<
		| (string | number)[]
		| SharedValue<(string | number)[]>
		| Readonly<(string | number)[] | SharedValue<(string | number)[]>>
	>(useMemo(() => ["50%", "70%"], []));
	const {
		setShowBottomSheetModal,
		bottomSheetModalKeys,
		createBottomSheetModal,
	} = useBottomSheetModalStore();
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		console.log("MODAL KEY", modalKey);
		createBottomSheetModal(modalKey);

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
		if (index === -1) setShowBottomSheetModal(modalKey, false);
	}, []);

	useEffect(() => {
		const isVisible = bottomSheetModalKeys[modalKey];
		console.log(
			bottomSheetModalKeys[modalKey],
			"CHANGED",
			bottomSheetModalKeys
		);

		if (isVisible !== isModalVisible) {
			setIsModalVisible(isVisible);
		}
	}, [bottomSheetModalKeys]);

	useEffect(() => {
		if (isModalVisible && bottomSheetRef.current) {
			bottomSheetRef.current.present();
		}
	}, [isModalVisible]);

	const renderBackdrop = useCallback(
		(props: BottomSheetDefaultBackdropProps) => (
			<BottomSheetBackdrop
				onPress={() => setShowBottomSheetModal(modalKey, false)}
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
			/>
		),
		[]
	);

	return (
		<BottomSheetModal
			backdropComponent={renderBackdrop}
			keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
			android_keyboardInputMode="adjustResize"
			keyboardBlurBehavior="restore"
			ref={bottomSheetRef}
			index={bottomSheetModalKeys[modalKey] ? 1 : -1}
			snapPoints={defaultSnapPoints}
			onChange={handleSheetChanges}
			{...rest}
		>
			<View style={{ flex: 1, paddingBottom: 20 }}>{children}</View>
		</BottomSheetModal>
	);
};

export default memo(CustomBottomSheetModal);
