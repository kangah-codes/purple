import React, { useMemo, useCallback, memo } from 'react';
import { View, Text } from 'react-native';

interface StackItem {
    value: number;
    color: string;
}

interface StackDataItem {
    label: string;
    stacks: StackItem[];
}

interface CustomBarChartProps {
    stackData: StackDataItem[];
    width: number;
    height: number;
    maxValue: number;
    mostNegativeValue: number;
    formatYLabel: (label: string) => string;
    barWidth: number;
    spacing: number;
    noOfSections: number;
    stepValue?: number;
}

function niceRound(value: number) {
    const magnitude = 10 ** Math.floor(Math.log10(value));
    return Math.ceil(value / magnitude) * magnitude;
}

export default memo(function CustomBarChart({
    stackData,
    width,
    height,
    maxValue,
    mostNegativeValue,
    formatYLabel,
    barWidth,
    spacing,
    noOfSections,
    stepValue,
}: CustomBarChartProps) {
    const yAxisLabelWidth = 40;
    const chartWidth = width - yAxisLabelWidth;
    const chartHeight = height - 40; // space for x-axis labels

    // ---------------------------
    // 1. SCALE DATA & BOUNDS
    // ---------------------------
    const { scaledMaxValue, scaledMinValue, scaledStackData } = useMemo(() => {
        // Round up for positive side, down for negative side
        const cappedMax = niceRound(maxValue); // 252,879 → 300,000
        const cappedMin = -niceRound(Math.abs(mostNegativeValue)); // -2,500 → -3,000

        // Clamp stack values so nothing exceeds caps
        const scaledData = stackData.map((item) => ({
            ...item,
            stacks: item.stacks.map((stack) => ({
                ...stack,
                value: Math.min(Math.max(stack.value, cappedMin), cappedMax),
            })),
        }));

        return {
            scaledMaxValue: cappedMax,
            scaledMinValue: cappedMin,
            scaledStackData: scaledData,
        };
    }, [stackData, maxValue, mostNegativeValue]);

    // Chart calculations
    const totalRange = scaledMaxValue - scaledMinValue;
    const scale = chartHeight / totalRange;
    const zeroLineY = (scaledMaxValue / totalRange) * chartHeight;

    // ---------------------------
    // 2. Y-AXIS LABELS
    // ---------------------------
    const yAxisLabels = useMemo(() => {
        const labels: number[] = [];
        const rawStep = totalRange / noOfSections;

        // Step size: prefer user stepValue if provided
        const thresholds = [
            100, 500, 1000, 2500, 5000, 10000, 50000, 100000, 250000, 500000, 1000000,
        ];
        const divisor = thresholds.find((t) => rawStep <= t) || thresholds[thresholds.length - 1];
        const niceStep = stepValue || Math.ceil(rawStep / divisor) * divisor;

        // Build labels from max down to min
        for (let val = scaledMaxValue; val >= scaledMinValue; val -= niceStep) {
            labels.push(val);
        }

        // Ensure zero is included
        if (!labels.includes(0)) labels.push(0);

        // Sort descending
        labels.sort((a, b) => b - a);
        return labels;
    }, [scaledMaxValue, scaledMinValue, totalRange, noOfSections, stepValue]);

    // ---------------------------
    // 3. BAR POSITIONS
    // ---------------------------
    const barPositions = useMemo(() => {
        let currentX = yAxisLabelWidth;
        return scaledStackData.map((item) => {
            const x = currentX;
            currentX += barWidth + spacing;
            return { ...item, x };
        });
    }, [scaledStackData, barWidth, spacing]);

    // ---------------------------
    // 4. RENDER STACKS
    // ---------------------------
    const renderStack = useCallback(
        (stack: StackItem, barX: number, baseY: number, isPositive: boolean) => {
            const stackHeight = Math.abs(stack.value) * scale;
            const stackY = isPositive ? baseY - stackHeight : baseY;

            return (
                <View
                    key={`${barX}-${stack.color}-${stack.value}`}
                    style={{
                        position: 'absolute',
                        left: barX,
                        top: stackY,
                        width: barWidth,
                        height: stackHeight,
                        backgroundColor: stack.color,
                        borderRadius: 2,
                    }}
                />
            );
        },
        [scale, barWidth],
    );

    const renderedBars = useMemo(() => {
        return barPositions.map((bar) => {
            const positiveStacks = bar.stacks.filter((s) => s.value > 0);
            const negativeStacks = bar.stacks.filter((s) => s.value < 0);

            let positiveY = zeroLineY;
            let negativeY = zeroLineY;
            const bars: JSX.Element[] = [];

            positiveStacks.forEach((stack) => {
                bars.push(renderStack(stack, bar.x, positiveY, true));
                positiveY -= stack.value * scale;
            });

            negativeStacks.forEach((stack) => {
                bars.push(renderStack(stack, bar.x, negativeY, false));
                negativeY += Math.abs(stack.value) * scale;
            });

            return bars;
        });
    }, [barPositions, zeroLineY, renderStack, scale]);

    // ---------------------------
    // 5. RENDER AXES, LABELS, GRID
    // ---------------------------
    const renderYAxisLabels = useCallback(() => {
        return yAxisLabels.map((value) => {
            const normalizedPosition = (scaledMaxValue - value) / totalRange;
            const y = normalizedPosition * chartHeight;
            const clampedY = Math.max(0, Math.min(y - 8, chartHeight - 16));

            return (
                <Text
                    key={value}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: clampedY,
                        width: yAxisLabelWidth - 5,
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                        textAlign: 'right',
                        color: '#000',
                    }}
                >
                    {formatYLabel(value.toString())}
                </Text>
            );
        });
    }, [yAxisLabels, scaledMaxValue, totalRange, chartHeight, yAxisLabelWidth, formatYLabel]);

    const renderGridLines = useCallback(() => {
        return yAxisLabels.map((value) => {
            const normalizedPosition = (scaledMaxValue - value) / totalRange;
            const y = normalizedPosition * chartHeight;

            return (
                <View
                    key={value}
                    style={{
                        position: 'absolute',
                        left: yAxisLabelWidth,
                        top: y,
                        width: chartWidth,
                        borderStyle: 'dotted',
                        borderWidth: 0.5,
                        borderColor: '#e9d4ff',
                        opacity: 0.5,
                    }}
                />
            );
        });
    }, [yAxisLabels, scaledMaxValue, totalRange, chartHeight, yAxisLabelWidth, chartWidth]);

    const renderXAxisLabels = useCallback(() => {
        return barPositions.map((bar) => (
            <Text
                key={bar.label}
                style={{
                    position: 'absolute',
                    left: bar.x,
                    top: chartHeight + 20,
                    width: barWidth,
                    fontSize: 12,
                    fontFamily: 'SatoshiBold',
                    textAlign: 'center',
                    color: '#000',
                }}
            >
                {bar.label.toUpperCase()}
            </Text>
        ));
    }, [barPositions, chartHeight, barWidth]);

    const renderZeroLine = useCallback(() => {
        return (
            <View
                style={{
                    position: 'absolute',
                    left: yAxisLabelWidth,
                    top: zeroLineY,
                    width: chartWidth,
                    borderStyle: 'dotted',
                    borderWidth: 0.5,
                    borderColor: '#e9d4ff',
                    opacity: 0.5,
                }}
            />
        );
    }, [zeroLineY, yAxisLabelWidth, chartWidth]);

    // ---------------------------
    // 6. RENDER CHART
    // ---------------------------
    return (
        <View style={{ width, height, position: 'relative' }}>
            <View style={{ position: 'relative', width, height }}>
                {renderGridLines()}
                {renderZeroLine()}
                {renderYAxisLabels()}
                {renderedBars}
                {renderXAxisLabels()}
            </View>
        </View>
    );
});
