import React, { useMemo, useCallback, memo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

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
    showTrendLine?: boolean;
    trendLineColor?: string;
}

function niceRound(value: number) {
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(Math.abs(value), 1)));
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
    showTrendLine = false,
    trendLineColor = '#000',
}: CustomBarChartProps) {
    const yAxisLabelWidth = 40;
    const chartWidth = width - yAxisLabelWidth;
    const chartHeight = height - 40; // space for x-axis labels

    // ---------------------------
    // 1. SCALE DATA & BOUNDS
    // ---------------------------
    const { scaledMaxValue, scaledMinValue, scaledStackData } = useMemo(() => {
        let cappedMax: number;
        let cappedMin: number;

        if (stepValue && stepValue > 0) {
            cappedMax = Math.ceil(Math.max(maxValue, 0) / stepValue) * stepValue;
            cappedMin = Math.floor(Math.min(mostNegativeValue, 0) / stepValue) * stepValue;
        } else {
            // Round up for positive side, down for negative side (keeps caps sane)
            cappedMax = niceRound(Math.max(maxValue, 0));
            cappedMin = -niceRound(Math.max(Math.abs(mostNegativeValue), 0));
        }

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
    }, [stackData, maxValue, mostNegativeValue, stepValue]);

    // Chart calculations
    const totalRange = scaledMaxValue - scaledMinValue || 1;
    const scale = chartHeight / totalRange;
    const zeroLineY = (() => {
        // zero location relative to top of chart
        const ratio = (scaledMaxValue - 0) / totalRange;
        const y = ratio * chartHeight;
        return Math.max(0, Math.min(y, chartHeight));
    })();

    // small helper to round display values (keeps integers; adjust if you want other formatting)
    const roundVal = (v: number) => {
        // avoid -0
        const rounded = Math.round(v);
        return Object.is(rounded, -0) ? 0 : rounded;
    };

    // ---------------------------
    // 2. Y-AXIS LABELS (RELIABLE & EVEN)
    // ---------------------------
    const yAxisLabels = useMemo(() => {
        const labels: number[] = [];
        const range = scaledMaxValue - scaledMinValue;

        if (stepValue !== undefined && stepValue > 0) {
            // Use provided stepValue: build labels from top down, ensure we include scaledMinValue as last label
            // Start at scaledMaxValue and subtract stepValue until <= scaledMinValue
            for (let v = scaledMaxValue; v >= scaledMinValue - 1e-8; v -= stepValue) {
                labels.push(roundVal(v));
                // safety guard to avoid infinite loop with floating issues
                if (labels.length > 200) break;
            }
            // ensure exact min included
            if (labels.length === 0 || labels[labels.length - 1] !== roundVal(scaledMinValue)) {
                labels.push(roundVal(scaledMinValue));
            }
        } else {
            // No explicit stepValue: produce exactly (noOfSections + 1) labels evenly spaced
            for (let i = 0; i <= noOfSections; i++) {
                const val = scaledMaxValue - (range * i) / noOfSections;
                labels.push(roundVal(val));
            }
        }

        // If rounding produced duplicate neighbouring labels (rare), collapse duplicates while preserving spacing
        const deduped: number[] = [];
        for (let i = 0; i < labels.length; i++) {
            if (i === 0 || labels[i] !== labels[i - 1]) deduped.push(labels[i]);
        }

        return deduped;
    }, [scaledMaxValue, scaledMinValue, noOfSections, stepValue]);

    // ---------------------------
    // 3. BAR POSITIONS
    // ---------------------------
    const barPositions = useMemo(() => {
        let currentX = yAxisLabelWidth + 8; // small padding
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
        (stack: StackItem, barX: number, baseY: number, isPositive: boolean, idx: number) => {
            const stackHeight = Math.abs(stack.value) * scale;
            const stackY = isPositive ? baseY - stackHeight : baseY;

            return (
                <View
                    key={`stack-${barX}-${idx}-${stack.color}-${stack.value}`}
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

    // Calculate center points for trend line
    const trendLinePoints = useMemo(() => {
        const points: { x: number; y: number }[] = [];

        barPositions.forEach((bar) => {
            const totalValue = bar.stacks.reduce((sum, stack) => sum + stack.value, 0);

            // Calculate Y position of the center of the entire stack
            // If positive, center is halfway from zero to the top
            // If negative, center is halfway from zero to the bottom
            const stackHeight = Math.abs(totalValue) * scale;
            const centerY =
                totalValue >= 0 ? zeroLineY - stackHeight / 2 : zeroLineY + stackHeight / 2;

            // X position is center of the bar
            const centerX = bar.x + barWidth / 2;

            points.push({ x: centerX, y: centerY });
        });

        return points;
    }, [barPositions, zeroLineY, scale, barWidth]);

    const renderedBars = useMemo(() => {
        const all: JSX.Element[] = [];
        barPositions.forEach((bar, barIndex) => {
            const positiveStacks = bar.stacks.filter((s) => s.value > 0);
            const negativeStacks = bar.stacks.filter((s) => s.value < 0);

            let positiveY = zeroLineY;
            let negativeY = zeroLineY;

            positiveStacks.forEach((stack, idx) => {
                all.push(renderStack(stack, bar.x, positiveY, true, barIndex * 1000 + idx));
                positiveY -= stack.value * scale;
            });

            negativeStacks.forEach((stack, idx) => {
                all.push(renderStack(stack, bar.x, negativeY, false, barIndex * 1000 + idx));
                negativeY += Math.abs(stack.value) * scale;
            });
        });
        return all;
    }, [barPositions, zeroLineY, renderStack, scale]);

    // ---------------------------
    // 5. RENDER AXES, LABELS, GRID
    // ---------------------------
    const renderYAxisLabels = useCallback(() => {
        const steps = Math.max(1, yAxisLabels.length - 1);
        return yAxisLabels.map((value, index) => {
            // index 0 => top; index steps => bottom
            const y = (index / steps) * chartHeight;
            const top = Math.max(0, Math.min(chartHeight - 16, y - 8)); // keep inside chart
            return (
                <Text
                    key={`ylabel-${value}-${index}`}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top,
                        width: yAxisLabelWidth - 6,
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
    }, [yAxisLabels, chartHeight, yAxisLabelWidth, formatYLabel]);

    const renderGridLines = useCallback(() => {
        const steps = Math.max(1, yAxisLabels.length - 1);
        return (
            <Svg
                width={chartWidth}
                height={chartHeight}
                style={{
                    position: 'absolute',
                    left: yAxisLabelWidth,
                    top: 0,
                }}
            >
                {yAxisLabels.map((value, index) => {
                    const y = (index / steps) * chartHeight;
                    return (
                        <Line
                            key={`grid-${value}-${index}`}
                            x1={0}
                            y1={y}
                            x2={chartWidth}
                            y2={y}
                            stroke={'#e9d4ff'}
                            strokeWidth={1.5}
                            strokeDasharray={[4, 4]}
                            opacity={0.5}
                        />
                    );
                })}
            </Svg>
        );
    }, [yAxisLabels, chartWidth, chartHeight, yAxisLabelWidth]);

    const renderXAxisLabels = useCallback(() => {
        return barPositions.map((bar) => (
            <Text
                key={`xlabel-${bar.label}`}
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
        const top = Math.max(0, Math.min(zeroLineY, chartHeight));
        return (
            <View
                key='zeroline'
                style={{
                    position: 'absolute',
                    left: yAxisLabelWidth,
                    top,
                    width: chartWidth,
                    height: 1,
                    backgroundColor: '#e9d4ff',
                    opacity: 0.6,
                }}
            />
        );
    }, [zeroLineY, yAxisLabelWidth, chartWidth, chartHeight]);

    const renderTrendLine = useCallback(() => {
        if (!showTrendLine || trendLinePoints.length < 2) return null;

        return (
            <Svg
                width={chartWidth}
                height={chartHeight}
                style={{
                    position: 'absolute',
                    left: yAxisLabelWidth,
                    top: 0,
                }}
            >
                {trendLinePoints.map((point, index) => {
                    if (index === trendLinePoints.length - 1) return null;

                    const nextPoint = trendLinePoints[index + 1];
                    // Adjust X coordinates relative to yAxisLabelWidth since SVG is offset
                    const x1 = point.x - yAxisLabelWidth;
                    const x2 = nextPoint.x - yAxisLabelWidth;

                    return (
                        <Line
                            key={`trend-${index}`}
                            x1={x1}
                            y1={point.y}
                            x2={x2}
                            y2={nextPoint.y}
                            stroke={trendLineColor}
                            strokeWidth={2}
                            strokeDasharray={[6, 6]}
                        />
                    );
                })}
                {trendLinePoints.map((point, index) => {
                    const cx = point.x - yAxisLabelWidth;
                    return (
                        <Circle
                            key={`trend-dot-${index}`}
                            cx={cx}
                            cy={point.y}
                            r={4}
                            fill={trendLineColor}
                            stroke='white'
                            strokeWidth={2}
                        />
                    );
                })}
            </Svg>
        );
    }, [showTrendLine, trendLinePoints, chartWidth, chartHeight, yAxisLabelWidth, trendLineColor]);

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
                {renderTrendLine()}
                {renderXAxisLabels()}
            </View>
        </View>
    );
});
