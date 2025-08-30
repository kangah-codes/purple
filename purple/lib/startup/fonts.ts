import * as Font from 'expo-font';

export async function loadFonts() {
    try {
        await Font.loadAsync({
            SatoshiBlack: require('../../assets/fonts/satoshi/Satoshi-Black.otf'),
            SatoshiBlackItalic: require('../../assets/fonts/satoshi/Satoshi-BlackItalic.otf'),
            SatoshiBold: require('../../assets/fonts/satoshi/Satoshi-Bold.otf'),
            SatoshiBoldItalic: require('../../assets/fonts/satoshi/Satoshi-BoldItalic.otf'),
            SatoshiItalic: require('../../assets/fonts/satoshi/Satoshi-Italic.otf'),
            SatoshiLight: require('../../assets/fonts/satoshi/Satoshi-Light.otf'),
            SatoshiLightItalic: require('../../assets/fonts/satoshi/Satoshi-LightItalic.otf'),
            SatoshiMedium: require('../../assets/fonts/satoshi/Satoshi-Medium.otf'),
            SatoshiMediumItalic: require('../../assets/fonts/satoshi/Satoshi-MediumItalic.otf'),
            SatoshiRegular: require('../../assets/fonts/satoshi/Satoshi-Regular.otf'),

            RobotoFlexMedium: require('../../assets/fonts/roboto-flex/RobotoFlex-Medium.otf'),
        });
    } catch (e) {
        console.warn(e);
    }
}
