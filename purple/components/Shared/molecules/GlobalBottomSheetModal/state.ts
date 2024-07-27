import { create } from "zustand";

/**
 * @description This function creates a store for the bottom sheet select component
 * @returns {Object} The bottom sheet select store
 */
export const createBottomSheetModalStore = create<{
	showBottomSheetModal: boolean;
	toggleShowBottomSheetModal: (key: string, show: boolean) => void;
	createBottomSheetModal: (key: string) => void;
	bottomSheetModalKeys: Record<string, boolean>;
}>((set, get) => {
	return {
		showBottomSheetModal: false,
		toggleShowBottomSheetModal: (key: string, show: boolean) => {
			set((state) => {
				return {
					...state,
					bottomSheetModalKeys: {
						...state.bottomSheetModalKeys,
						[key]: show,
					},
				};
			});
		},
		createBottomSheetModal: (key: string) =>
			set((state) => {
				return {
					...state,
					bottomSheetModalKeys: {
						...state.bottomSheetModalKeys,
						[key]: false,
					},
				};
			}),
		bottomSheetModalKeys: {},
	};
});
