import { create } from 'zustand';

type BottomSheetFlatListState = {
    bottomSheetFlatListKeys: Record<string, boolean>;
    toggleShowBottomSheetFlatList: (key: string, show: boolean) => void;
    createBottomSheetFlatList: (key: string) => void;
    closeAllSheets: () => void;
};

export const createBottomSheetFlatListStore = create<BottomSheetFlatListState>((set) => {
    return {
        bottomSheetFlatListKeys: {},

        toggleShowBottomSheetFlatList: (key: string, show: boolean) => {
            set((state) => {
                const updatedKeys = { ...state.bottomSheetFlatListKeys };

                if (show) {
                    Object.keys(updatedKeys).forEach((sheetKey) => {
                        if (sheetKey !== key && updatedKeys[sheetKey]) {
                            updatedKeys[sheetKey] = false;
                        }
                    });
                }

                updatedKeys[key] = show;

                return {
                    ...state,
                    bottomSheetFlatListKeys: updatedKeys,
                };
            });
        },

        createBottomSheetFlatList: (key: string) => {
            set((state) => {
                if (state.bottomSheetFlatListKeys[key] === undefined) {
                    return {
                        ...state,
                        bottomSheetFlatListKeys: {
                            ...state.bottomSheetFlatListKeys,
                            [key]: false,
                        },
                    };
                }
                return state;
            });
        },

        closeAllSheets: () => {
            set((state) => {
                const updatedKeys = { ...state.bottomSheetFlatListKeys };

                Object.keys(updatedKeys).forEach((key) => {
                    updatedKeys[key] = false;
                });

                return {
                    ...state,
                    bottomSheetFlatListKeys: updatedKeys,
                };
            });
        },
    };
});
