import React from 'react';
import { Switch as RNSwitch } from 'react-native-switch';

type SwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
};

export default function Switch({ value, onValueChange }: SwitchProps) {
    return (
        <RNSwitch
            value={value}
            onValueChange={onValueChange}
            activeText={''}
            inActiveText={''}
            backgroundActive='#9810fa'
            backgroundInactive='#dab2ff'
            circleSize={20}
            barHeight={30}
            circleBorderWidth={0}
            switchWidthMultiplier={2.9}
            containerStyle={{
                transform: [{ scale: 0.8 }],
            }}
        />
    );
}
