import { useStore } from "zustand";
import { createBottomSheetModalStore } from "./state";

export function useBottomSheetModalStore() {
	const [showBottomSheetModal, setShowBottomSheetModal] = useStore(
		createBottomSheetModalStore,
		(state) => [
			state.showBottomSheetModal,
			state.toggleShowBottomSheetModal,
		]
	);

	return {
		showBottomSheetModal,
		setShowBottomSheetModal,
	};
}
