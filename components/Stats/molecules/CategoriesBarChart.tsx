import { View } from "@/components/Shared/styled";
import { BarChart } from "react-native-gifted-charts";

export default function CategoriesBarChart() {
	const stackData = [
		{
			stacks: [
				{ value: 10, color: "#7E22CE" },
				{ value: 20, color: "#C084FC", marginBottom: 2 },
			],
			label: "Shopping",
		},
		{
			stacks: [
				{ value: 10, color: "#C084FC" },
				{ value: 11, color: "#7E22CE", marginBottom: 2 },
			],
			label: "Mar",
		},
		{
			stacks: [
				{ value: 14, color: "#7E22CE" },
				{ value: 18, color: "#C084FC", marginBottom: 2 },
			],
			label: "Feb",
		},
		{
			stacks: [
				{ value: 7, color: "#C084FC" },
				{ value: 11, color: "#7E22CE", marginBottom: 2 },
			],
			label: "Mar",
		},
		{
			stacks: [
				{ value: 7, color: "#C084FC" },
				{ value: 11, color: "#7E22CE", marginBottom: 2 },
			],
			label: "Mar",
		},
	];

	return (
		<View className="ml-[-10] pb-2.5">
			<BarChart
				width={340}
				rotateLabel
				spacing={25}
				// hideRules
				// hideYAxisText
				// hide the line on the x axis
				// hideAxesAndRules
				// spacing={9.2}
				color="#7E22CE"
				barBorderRadius={5}
				initialSpacing={20}
				// maxValue={900}
				yAxisColor="white"
				xAxisColor={"white"}
				// yAxisThickness={0}
				// rulesType="solid"
				// rulesColor="#F3E8FF"
				// yAxisTextStyle={{ color: "gray" }}
				// yAxisSide="right"
				// xAxisColor="lightgray"
				disableScroll
				stackData={stackData}
				hideRules
				// hideYAxisText
				// hide the line on the x axis
				// hideAxesAndRules
			/>
		</View>
	);
}
