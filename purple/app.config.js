export default ({ config }) => {
    const isDev = process.env.EAS_BUILD_PROFILE === 'development';

    return {
        ...config,
        name: isDev ? 'Purple Dev' : 'Purple',
        slug: isDev ? 'purple-dev' : 'purple',
        scheme: isDev ? 'com.akangah89.PurpleDev' : 'com.akangah89.Purple',
        version: '0.1.0',
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
            bundleIdentifier: isDev ? 'com.akangah89.PurpleDev' : 'com.akangah89.Purple',
        },
        android: {
            package: isDev ? 'com.akangah89.PurpleDev' : 'com.akangah89.Purple',
            adaptiveIcon: {
                foregroundImage: './assets/images/icon.png',
                backgroundColor: '#00000000',
            },
        },
        plugins: [
            'expo-router',
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
        },
        runtimeVersion: {
            policy: 'appVersion',
        },
    };
};
