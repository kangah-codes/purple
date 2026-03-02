import { EyeCloseIcon, EyeOpenIcon } from '@/components/SVG/icons/noscale';
import { useState } from 'react';
import { TextInputProps } from 'react-native';
import { InputField, View } from '../../styled';

type ProtectedInputProps = TextInputProps & {
    className?: string;
};

export default function ProtectedInput(props: ProtectedInputProps) {
    const [hideValue, setHideValue] = useState(true);
    return (
        <View className='relative flex justify-center'>
            <InputField {...props} secureTextEntry={hideValue} />

            <View className='absolute right-0 flex pr-5 z-1'>
                {hideValue ? (
                    <EyeOpenIcon
                        width={16}
                        height={16}
                        stroke='#7E22CE'
                        onPress={() => setHideValue(false)}
                    />
                ) : (
                    <EyeCloseIcon
                        width={16}
                        height={16}
                        stroke='#7E22CE'
                        onPress={() => setHideValue(true)}
                    />
                )}
            </View>
        </View>
    );
}
