import { BaseToastProps } from 'react-native-toast-message';
import Toast from './components';

export const toastConfig = {
    success: ({ props }: { props: BaseToastProps }) => <Toast type='success' {...props} />,
    warning: ({ props }: { props: BaseToastProps }) => <Toast type='warning' {...props} />,
    info: ({ props }: { props: BaseToastProps }) => <Toast type='info' {...props} />,
    error: ({ props }: { props: BaseToastProps }) => <Toast type='error' {...props} />,
};
