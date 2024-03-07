import { useStore } from "zustand";
import { createBottomSheetFlatListStore } from "./state";

/**
 * Custom hook for managing the state of a bottom sheet modal.
 * @returns An object containing the state and functions for managing the bottom sheet modal.
 */
export function useBottomSheetFlatListStore(): {
	setShowBottomSheetFlatList: (key: string, show: boolean) => void;
	createBottomSheetFlatList: (key: string) => void;
	bottomSheetFlatListKeys: Record<string, boolean>;
} {
	const [
		setShowBottomSheetFlatList,
		createBottomSheetFlatList,
		bottomSheetFlatListKeys,
	] = useStore(createBottomSheetFlatListStore, (state) => [
		state.toggleShowBottomSheetFlatList,
		state.createBottomSheetFlatList,
		state.bottomSheetFlatListKeys,
	]);

	return {
		setShowBottomSheetFlatList,
		createBottomSheetFlatList,
		bottomSheetFlatListKeys,
	};
}
