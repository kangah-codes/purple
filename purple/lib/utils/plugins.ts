import { ConfigPlugin, withAndroidStyles } from '@expo/config-plugins';

export const withNavigationBarColor: ConfigPlugin = (config) => {
    return withAndroidStyles(config, (config) => {
        const styles = config.modResults;

        const appThemeStyle = styles?.resources?.style?.find(
            (style) => style.$.name === 'AppTheme',
        );

        if (appThemeStyle) {
            const existingItem = appThemeStyle.item.find(
                (item) => item.$.name === 'android:navigationBarColor',
            );

            if (existingItem) {
                existingItem._ = '@android:color/transparent';
            } else {
                appThemeStyle.item.push({
                    $: { name: 'android:navigationBarColor' },
                    _: '@android:color/transparent',
                });
            }
        }

        return config;
    });
};
