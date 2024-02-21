import { create } from "zustand";

/**
 * @description This function creates a store for the bottom sheet select component
 * @returns {Object} The bottom sheet select store
 */
export const createBottomSheetModalStore = create<{
	showBottomSheetModal: boolean;
	toggleShowBottomSheetModal: (show: boolean) => void;
}>((set) => {
	return {
		showBottomSheetModal: false,
		toggleShowBottomSheetModal: (show: boolean) => {
			set({ showBottomSheetModal: show });
		},
	};
});
