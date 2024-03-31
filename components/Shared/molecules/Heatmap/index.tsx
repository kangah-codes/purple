import { useState, useMemo, ReactNode } from "react";
import { LinearGradient, Text, TouchableOpacity, View } from "../../styled";
import { StyleProp, ViewStyle } from "react-native";
import { getColorIndex } from "./utils";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { colors } from "./constants";

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
	colors: string[][];
	onPressCallback?: (data: CellData) => void;
	renderCell?: (data: CellData, index: number) => ReactNode;
	startColumn: number;
};

export default function Heatmap({
	rows,
	cols,
	cellSize,
	cellStyle,
	data,
	colors,
	onPressCallback,
	renderCell,
	startColumn,
}: HeatmapProps) {
	const [cells, setCells] = useState([]);
	const now = new Date();
	const start = startOfMonth(now);
	const end = endOfMonth(now);
	const monthDays = eachDayOfInterval({ start, end });
	const offset = new Date(
		monthDays[0].getFullYear(),
		monthDays[0].getMonth(),
		1
	).getDay();

	useMemo(() => {
		const newCells = [];
		const offsetData = Array(startColumn).fill({
			value: 0,
			key: "nothing",
			index: 0,
		});
		const fullData = [...offsetData, ...data];
		const weeks = Math.ceil(fullData.length / cols);

		for (let i = 0; i < weeks; i++) {
			const row = [];
			for (
				let j = i * cols;
				j < (i + 1) * cols && j < fullData.length;
				j++
			) {
				const colorIndex = getColorIndex(
					fullData[j].value,
					0,
					Math.max(...fullData.map((d) => d.value)),
					colors.length
				);

				if (fullData[j].key === "nothing") {
					row.push(
						<View
							key={j}
							style={{
								width: cellSize,
								height: cellSize,
								...cellStyle,
							}}
						/>
					);
					continue;
				}

				row.push(
					renderCell && renderCell(fullData[j], j) !== undefined ? (
						renderCell(fullData[j], j)
					) : (
						<TouchableOpacity
							key={j}
							onPress={() =>
								onPressCallback && onPressCallback(fullData[j])
							}
						>
							<LinearGradient
								style={{
									width: cellSize,
									height: cellSize,
									...cellStyle,
								}}
								colors={colors[colorIndex]}
							></LinearGradient>
						</TouchableOpacity>
					)
				);
			}
			newCells.push(
				<View key={i} style={{ flexDirection: "row" }}>
					{row}
				</View>
			);
		}

		// @ts-ignore
		setCells(newCells);
	}, [data, cellSize, cellStyle]);

	return <View className="flex">{cells}</View>;
}

Heatmap.defaultProps = {
	rows: 4,
	cols: 7,
	cellSize: 10,
	cellStyle: {
		margin: 2,
		borderRadius: 8,
	},
	colors,
	startColumn: 0,
};
