import { ReactNode, useMemo } from "react";
import { ViewStyle } from "react-native";
import { LinearGradient, TouchableOpacity, View } from "../../styled";
import { colors } from "./constants";
import { getColorIndex } from "./utils";

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
	const generateCells = useMemo(() => {
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
							/>
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
		return newCells;
	}, [data, cellSize, cellStyle]);

	return <View style={{ flex: 1 }}>{generateCells}</View>;
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
