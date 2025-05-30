### Analytics docs

#### Usage

```tsx
return (
    <AnalyticsProvider
        config={{
            endpoint: 'URL',
            apiKey: 'API_KEY',
            enableDebugLogs: true,
            syncEveryMs: 20000,
            batchSize: 25,
        }}
        onInitialized={(analytics) => {
            console.log('Analytics initialised!');
        }}
        onError={(error) => {
            console.error('Analytics error:', error);
        }}
        autoFlushOnBackground={true}
    >
        <RootView />
    </AnalyticsProvider>
);
```

```tsx
const Screen = () => {
    const { logEvent, logError, setUserId, isInitialized } = useAnalytics();

    const handleButtonPress = async () => {
        await logEvent('button_tap', {
            button: 'submit',
            screen: 'transactions_screen',
        });
    };

    return <View></View>;
};
```

```tsx
const HomeScreen = () => {
    useScreenTracking('home', {
        source: 'navigation',
    });

    return <View></View>;
};
```
