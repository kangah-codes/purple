import { withAndroidStyles } from '@expo/config-plugins';
import pkg from './package.json';

const withNavigationBarColor = (config) => {
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

export default ({ config }) => {
    // eslint-disable-next-line no-undef
    const isDev = process.env.EAS_BUILD_PROFILE === 'development';
    // eslint-disable-next-line no-undef
    const isRc = process.env.EAS_BUILD_PROFILE === 'rc';

    return {
        ...config,
        name: isDev ? 'Purple Dev' : isRc ? 'Purple RC' : 'Purple',
        slug: isDev ? 'purple-dev' : isRc ? 'purple-rc' : 'purple',
        scheme: isDev
            ? 'com.akangah89.PurpleDev'
            : isRc
            ? 'com.akangah89.PurpleRC'
            : 'com.akangah89.Purple',
        version: pkg.version,
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
            width: 320,
            height: 320,
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: false,
            bundleIdentifier: isDev
                ? 'com.akangah89.PurpleDev'
                : isRc
                ? 'com.akangah89.PurpleRc'
                : 'com.akangah89.Purple',
            scheme: isDev ? 'PurpleDev' : isRc ? 'PurpleRc' : 'Purple',
        },
        android: {
            package: isDev
                ? 'com.akangah89.PurpleDev'
                : isRc
                ? 'com.akangah89.PurpleRc'
                : 'com.akangah89.Purple',
            adaptiveIcon: {
                foregroundImage: './assets/images/icon.png',
                backgroundColor: '#00000000',
            },
        },
        plugins: [
            'expo-router',
            [
                'expo-notifications',
                {
                    icon: './assets/images/icon.png',
                    color: '#ffffff',
                    defaultChannel: 'default',
                },
            ],
            [
                'expo-font',
                {
                    fonts: [
                        './assets/fonts/satoshi/Satoshi-Black.otf',
                        './assets/fonts/satoshi/Satoshi-BlackItalic.otf',
                        './assets/fonts/satoshi/Satoshi-Bold.otf',
                        './assets/fonts/satoshi/Satoshi-BoldItalic.otf',
                        './assets/fonts/satoshi/Satoshi-Italic.otf',
                        './assets/fonts/satoshi/Satoshi-Light.otf',
                        './assets/fonts/satoshi/Satoshi-LightItalic.otf',
                        './assets/fonts/satoshi/Satoshi-Medium.otf',
                        './assets/fonts/satoshi/Satoshi-MediumItalic.otf',
                        './assets/fonts/satoshi/Satoshi-Regular.otf',
                    ],
                },
            ],
            'expo-secure-store',
            [
                'expo-build-properties',
                {
                    ios: {
                        newArchEnabled: false,
                    },
                    android: {
                        newArchEnabled: false,
                    },
                },
            ],
            [
                'expo-splash-screen',
                {
                    backgroundColor: '#ffffff',
                    image: './assets/images/splash.png',
                    imageWidth: 320,
                },
            ],
            [
                'expo-sqlite',
                {
                    enableFTS: true,
                    useSQLCipher: true,
                    android: {
                        enableFTS: false,
                        useSQLCipher: false,
                    },
                    ios: {
                        customBuildFlags: [
                            '-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1',
                        ],
                    },
                },
            ],
            [
                '@sentry/react-native/expo',
                {
                    url: 'https://sentry.io/',
                    project: 'react-native',
                    organization: 'purple-hg',
                },
            ],
            'expo-localization',
            withNavigationBarColor,
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: '381fc979-2396-4f04-93f0-bdfea57f48d2',
            },
        },
        owner: 'akangah89',
        updates: {
            url: 'https://u.expo.dev/381fc979-2396-4f04-93f0-bdfea57f48d2',
            fallbackToCacheTimeout: 0,
            runtimeVersion: '0.2.0',
        },
        // runtimeVersion: {
        //     policy: 'appVersion',
        // },
    };
};
