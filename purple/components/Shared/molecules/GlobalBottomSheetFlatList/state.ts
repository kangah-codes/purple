import { create } from "zustand";

/**
 * @description This function creates a store for the bottom sheet select component
 * @returns {Object} The bottom sheet select store
 */
export const createBottomSheetFlatListStore = create<{
	toggleShowBottomSheetFlatList: (key: string, show: boolean) => void;
	createBottomSheetFlatList: (key: string) => void;
	bottomSheetFlatListKeys: Record<string, boolean>;
}>((set) => {
	return {
		toggleShowBottomSheetFlatList: (key: string, show: boolean) => {
			set((state) => {
				return {
					...state,
					bottomSheetFlatListKeys: {
						...state.bottomSheetFlatListKeys,
						[key]: show,
					},
				};
			});
		},
		createBottomSheetFlatList: (key: string) =>
			set((state) => {
				return {
					...state,
					bottomSheetFlatListKeys: {
						...state.bottomSheetFlatListKeys,
						[key]: false,
					},
				};
			}),
		bottomSheetFlatListKeys: {},
	};
});
