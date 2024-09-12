import { ActivityIndicator, TextInputProps } from 'react-native';
import { InputField, View } from '../../styled';
import { EyeCloseIcon, EyeOpenIcon } from '@/components/SVG/noscale';
import { useEffect, useState } from 'react';

type AsyncInputProps = TextInputProps & {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
};

export default function AsyncInput(props: AsyncInputProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (props.isLoading) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [props.isLoading]);

    return (
        <View className='relative flex justify-center'>
            <InputField {...props} />

            {isLoading && (
                <View className='absolute right-0 flex pr-5 z-10'>
                    <ActivityIndicator />
                </View>
            )}
        </View>
    );
}
