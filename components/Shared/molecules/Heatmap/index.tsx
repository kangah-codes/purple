import { useState, useMemo, ReactNode } from "react";
import { LinearGradient, Text, TouchableOpacity, View } from "../../styled";
import { StyleProp, ViewStyle } from "react-native";
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
};

export default function Heatmap({
	rows,
	cols,
	cellSize,
	cellStyle,
	data,
	colors,
	onPressCallback,
}: HeatmapProps) {
	const [cells, setCells] = useState([]);

	useMemo(() => {
		const newCells = [];
		const weeks = Math.ceil(data.length / cols);
		for (let i = 0; i < weeks; i++) {
			const row = [];
			for (let j = i * cols; j < (i + 1) * cols && j < data.length; j++) {
				const colorIndex = getColorIndex(
					data[j].value,
					0,
					Math.max(...data.map((d) => d.value)),
					colors.length
				);

				row.push(
					<TouchableOpacity
						key={j}
						onPress={() =>
							onPressCallback && onPressCallback(data[j])
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
	colors: [
		["#E9D5FF", "#D8B4FE"],
		["#D8B4FE", "#C084FC"],
		["#C084FC", "#A855F7"],
		["#A855F7", "#9333EA"],
		["#9333EA", "#7E22CE"],
		["#7E22CE", "#6B21A8"],
		["#6B21A8", "#6B21A8"],
	],
};
