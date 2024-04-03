import Heatmap, { CellData } from "@/components/Shared/molecules/Heatmap";
import { colors } from "@/components/Shared/molecules/Heatmap/constants";
import { getColorIndex } from "@/components/Shared/molecules/Heatmap/utils";
import {
	LinearGradient,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import { StarsIcon } from "@/components/SVG/24x24";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	startOfMonth,
	getDay,
	parse,
} from "date-fns";
import { memo } from "react";
import { Dimensions } from "react-native";

function StatsHeatmap() {
	const now = new Date();
	const start = startOfMonth(now);
	const end = endOfMonth(now);
	const deviceWidth = Dimensions.get("window").width;
	const padding = 20;
	const numBlocksPerRow = 7; // for a week view
	const days = ["S", "M", "T", "W", "T", "F", "S"];
	const monthDays = eachDayOfInterval({ start, end });
	const offset = new Date(
		monthDays[0].getFullYear(),
		monthDays[0].getMonth(),
		1
	).getDay();
	const offsetData = Array(offset).fill({ value: 0, key: "", index: 0 });
	const finalMonthDays = [...offsetData, ...monthDays];

	// Subtract the padding from the device width and divide by the number of blocks per row
	const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;

	// Generate random heatmap values for each day of the month
	const values = finalMonthDays.map(() => Math.floor(Math.random() * 24));

	const click = (item: CellData) => {
		alert(
			`You clicked on ${format(finalMonthDays[item.index], "dd/MM/yyyy")}`
		);
	};

	return (
		<View className="flex flex-col">
			<View className="flex flex-row justify-between">
				{days.map((day, key) => (
					<View key={key} className="flex-1 items-center">
						<Text
							className="text-black text-base"
							style={{
								fontFamily: "InterSemiBold",
							}}
						>
							{day}
						</Text>
					</View>
				))}
			</View>
			<Heatmap
				cellSize={blockSize}
				rows={4}
				cols={numBlocksPerRow}
				data={monthDays.map((day, index) => ({
					value: values[index],
					key: format(day, "dd/MM/yyyy"),
					index: index + offset,
				}))}
				onPressCallback={click}
				startColumn={getDay(start)}
				renderCell={(data, index) => {
					// check if data.key is the same as current date
					const colorIndex = getColorIndex(
						values[index],
						0,
						Math.max(...values),
						colors.length
					);

					if (format(now, "dd/MM/yyyy") === data.key)
						return (
							<TouchableOpacity
								key={data.key}
								onPress={() => console.log(data, "CLICKED")}
							>
								<LinearGradient
									style={{
										width: blockSize,
										height: blockSize,
										margin: 2,
										borderRadius: 8,
									}}
									colors={colors[colorIndex]}
									className="flex items-center justify-center"
								>
									<StarsIcon stroke="#fff" fill={"#fff"} />
								</LinearGradient>
							</TouchableOpacity>
						);

					return undefined;
				}}
			/>
		</View>
	);
}

export default memo(StatsHeatmap);
