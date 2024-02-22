import { useStore } from "zustand";
import { createBottomSheetModalStore } from "./state";

/**
 * Custom hook for managing the state of a bottom sheet modal.
 * @returns An object containing the state and functions for managing the bottom sheet modal.
 */
export function useBottomSheetModalStore(): {
	showBottomSheetModal: boolean;
	setShowBottomSheetModal: (key: string, show: boolean) => void;
	createBottomSheetModal: (key: string) => void;
	bottomSheetModalKeys: Record<string, boolean>;
} {
	const [
		showBottomSheetModal,
		setShowBottomSheetModal,
		createBottomSheetModal,
		bottomSheetModalKeys,
	] = useStore(createBottomSheetModalStore, (state) => [
		state.showBottomSheetModal,
		state.toggleShowBottomSheetModal,
		state.createBottomSheetModal,
		state.bottomSheetModalKeys,
	]);

	return {
		showBottomSheetModal,
		setShowBottomSheetModal,
		createBottomSheetModal,
		bottomSheetModalKeys,
	};
}
