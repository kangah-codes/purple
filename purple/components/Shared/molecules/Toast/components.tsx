import { Text, View } from '@/components/Shared/styled';
import MegaphoneIcon from '@/components/SVG/24x24';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { BaseToastProps } from 'react-native-toast-message';

interface ToastProps extends BaseToastProps {
    type: 'info' | 'warning' | 'error' | 'success';
}

const toastStyles = StyleSheet.create({
    info: {
        backgroundColor: 'rgb(250, 245, 255)',
        borderColor: '#D8B4FE',
    },
    warning: {
        backgroundColor: 'rgb(255, 250, 240)',
        borderColor: '#F7D154',
    },
    error: {
        backgroundColor: 'rgb(255, 245, 245)',
        borderColor: '#F87171',
    },
    success: {
        backgroundColor: 'rgb(245, 255, 245)',
        borderColor: '#34D399',
    },
});

export default function Toast({ type, ...props }: ToastProps) {
    const getBackgroundColour = useCallback(() => {
        switch (type) {
            case 'info':
                return {
                    backgroundColor: '#F3E8FF',
                    titleFontColour: '#A855F7',
                    labelFontColour: '#7E22CE',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/6.png')}
                            style={tw`h-[25px] w-[25px] rounded-2xl`}
                        />
                    ),
                };
            case 'warning':
                return {
                    backgroundColor: '#FEF9C3',
                    titleFontColour: '#EAB308',
                    labelFontColour: '#A16207',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/18.png')}
                            style={tw`h-[25px] w-[25px] rounded-2xl`}
                        />
                    ),
                };
            case 'error':
                return {
                    backgroundColor: '#FEE2E2',
                    titleFontColour: '#EF4444',
                    labelFontColour: '#B91C1C',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/red-warning.png')}
                            style={tw`h-[20px] w-[20px] rounded-2xl`}
                        />
                    ),
                };
            case 'success':
                return {
                    backgroundColor: '#DCFCE7',
                    titleFontColour: '#22C55E',
                    labelFontColour: '#166534',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/17.png')}
                            style={tw`h-[34px] w-[34px] rounded-2xl`}
                        />
                    ),
                };
        }
    }, [type]);
    const styles = getBackgroundColour();

    return (
        <View
            className='w-[90%] rounded-full flex flex-row p-2 items-center mt-8 border'
            style={[toastStyles[type]]}
        >
            <View
                className='w-10 h-10 rounded-full flex items-center justify-center mr-2.5'
                style={{
                    backgroundColor: styles.backgroundColor,
                }}
            >
                {styles.image}
            </View>

            <View className='flex flex-col'>
                <Text
                    style={[
                        GLOBAL_STYLESHEET.suprapower,
                        {
                            color: styles.titleFontColour,
                        },
                    ]}
                    className='text-[15px]'
                >
                    {props.text1}
                </Text>
                <Text
                    style={[
                        GLOBAL_STYLESHEET.interRegular,
                        {
                            color: styles.labelFontColour,
                        },
                    ]}
                    className='text-sm tracking-tighter'
                >
                    {props.text2}
                </Text>
            </View>
        </View>
    );
}

Toast.defaultProps = {
    type: 'info',
};
