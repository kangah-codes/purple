import { create } from 'zustand';

interface ConfirmationModalState {
    isVisible: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ConfirmationModalStore extends ConfirmationModalState {
    showConfirmationModal: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmText?: string;
    }) => void;
    hideConfirmationModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalStore>((set) => ({
    isVisible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: undefined,
    onCancel: undefined,
    showConfirmationModal: (config) =>
        set({
            isVisible: true,
            title: config.title,
            message: config.message,
            confirmText: config.confirmText || 'Confirm',
            onConfirm: config.onConfirm,
            onCancel: config.onCancel,
        }),
    hideConfirmationModal: () =>
        set({
            isVisible: false,
            title: '',
            message: '',
            confirmText: 'Confirm',
            onConfirm: undefined,
            onCancel: undefined,
        }),
}));
