import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format } from 'date-fns';
import BudgetMonths from './components/Plans/molecules/NavigationArea/BudgetMonths';
import { satoshiFont } from './lib/constants/fonts';

export default function TestSwipePage() {
    const currentDate = new Date();

    // Generate some sample available months (last 6 months)
    const availableMonths = [];
    for (let i = 0; i < 6; i++) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        availableMonths.push(month);
    }

    const handleMonthChange = (date: Date) => {
        console.log('Month changed to:', format(date, 'MMMM yyyy'));
    };

    const renderContent = (month: Date) => {
        return (
            <ScrollView style={{ flex: 1, padding: 20 }}>
                <Text
                    style={[
                        { fontSize: 24, marginBottom: 20, color: '#1f2937' },
                        satoshiFont.satoshiBlack,
                    ]}
                >
                    {format(month, 'MMMM yyyy')}
                </Text>

                <View
                    style={{
                        backgroundColor: '#f3f4f6',
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 16,
                    }}
                >
                    <Text
                        style={[
                            { fontSize: 16, marginBottom: 8, color: '#374151' },
                            satoshiFont.satoshiBold,
                        ]}
                    >
                        Sample Content for {format(month, 'MMM yyyy')}
                    </Text>
                    <Text style={[{ fontSize: 14, color: '#6b7280' }, satoshiFont.satoshiMedium]}>
                        This is where you can add any content for this month. You can swipe left or
                        right to navigate between months, or tap on the month cards at the top.
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: '#fef3c7',
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 16,
                    }}
                >
                    <Text style={[{ fontSize: 14, color: '#92400e' }, satoshiFont.satoshiBold]}>
                        💡 Tips:
                    </Text>
                    <Text
                        style={[
                            { fontSize: 12, color: '#92400e', marginTop: 4 },
                            satoshiFont.satoshiMedium,
                        ]}
                    >
                        • Swipe horizontally to change months • Tap month cards for quick navigation
                        • Widget stays fixed at the top • Content area scrolls independently
                    </Text>
                </View>

                {/* Sample list items */}
                {Array.from({ length: 10 }, (_, i) => (
                    <View
                        key={i}
                        style={{
                            backgroundColor: 'white',
                            padding: 12,
                            marginBottom: 8,
                            borderRadius: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                        }}
                    >
                        <Text
                            style={[{ fontSize: 14, color: '#1f2937' }, satoshiFont.satoshiMedium]}
                        >
                            Sample Item {i + 1} for {format(month, 'MMM')}
                        </Text>
                        <Text
                            style={[{ fontSize: 12, color: '#6b7280' }, satoshiFont.satoshiRegular]}
                        >
                            This is a sample description for item {i + 1}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <BudgetMonths
                currentDate={currentDate}
                onMonthChange={handleMonthChange}
                renderContent={renderContent}
            />
        </View>
    );
}
