import React, { useState } from 'react';
import { StyleProp, ImageStyle } from 'react-native';
import { Image, ImageProps, ImageSource } from 'expo-image';

type FallbackImageProps = {
    source: ImageSource;
    fallbackSource: ImageSource;
    style?: StyleProp<ImageStyle>;
} & Omit<ImageProps, 'source'>;

export default function FallbackImage({ source, fallbackSource, ...rest }: FallbackImageProps) {
    const [error, setError] = useState(false);

    return (
        <Image source={error ? fallbackSource : source} onError={() => setError(true)} {...rest} />
    );
}
