import { FlashList } from '@shopify/flash-list';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient, TouchableOpacity, View } from '../../styled';
import { colors as defaultColors } from './constants';
import { getColorIndex } from './utils';

export type CellData = {
    value: number;
    key: string;
    index: number;
};

export type HeatmapProps = {
    rows: number;
    cols: number;
    cellSize: number;
    cellStyle?: ViewStyle;
    data: CellData[];
    colors?: string[][];
    onPressCallback?: (data: CellData) => void;
    renderCell?: (data: CellData, index: number) => ReactNode;
    startColumn: number;
};

export default function Heatmap({
    rows = 4,
    cols = 7,
    cellSize = 10,
    cellStyle = { margin: 2, borderRadius: 8 },
    data,
    colors = defaultColors,
    onPressCallback,
    renderCell,
    startColumn = 0,
}: HeatmapProps) {
    const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
    const fullData = useMemo(() => {
        const offsetData = Array(startColumn).fill({
            value: 0,
            key: 'nothing',
            index: 0,
        });
        return [...offsetData, ...data];
    }, [data, startColumn]);

    const handleCellPress = useCallback(
        (item: CellData) => {
            onPressCallback && onPressCallback(item);
        },
        [onPressCallback],
    );

    const renderItem = ({ item, index }: { item: CellData; index: number }) => {
        const colorIndex = getColorIndex(item.value, 0, maxValue, colors.length);

        if (item.key === 'nothing') {
            return (
                <View
                    style={{
                        width: cellSize,
                        height: cellSize,
                        ...cellStyle,
                    }}
                />
            );
        }

        return renderCell && renderCell(item, index) !== undefined ? (
            renderCell(item, index)
        ) : (
            <TouchableOpacity onPress={handleCellPress.bind(null, item)}>
                <LinearGradient
                    style={{
                        width: cellSize,
                        height: cellSize,
                        ...cellStyle,
                    }}
                    colors={colors[colorIndex]}
                />
            </TouchableOpacity>
        );
    };

    const keyExtractor = (item: CellData, index: number) => item.key + index.toString();

    return (
        <FlashList
            estimatedItemSize={cellSize}
            data={fullData}
            renderItem={renderItem as any}
            keyExtractor={keyExtractor}
            numColumns={cols}
            scrollEnabled={false}
            // getItemLayout={getItemLayout} here's to hoping commenting this out don't break anything
        />
    );
}
