/**
 * Test component for receipt zigzag edges
 */

import React from "react";
import { StyleSheet, Dimensions, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

const width = 300;

const App = () => {
	const renderZigZagView = () => {
		let nodes = [];
		const numberOfTeeth = 60; // Increase the number of teeth

		for (let i = 0; i < numberOfTeeth; i++) {
			const point = `${10 * i},0 ${10 * i + 5},10 ${10 * (i + 1)},0`; // Adjust the spacing between teeth
			nodes.push(
				<Polygon
					key={i}
					points={point}
					fill="#A855F7"
					stroke="#A855F7"
					strokeWidth="2"
				/>
			);
		}
		return nodes;
	};

	return (
		<View style={styles.container}>
			<View style={{ width, height: 100, backgroundColor: "cyan" }} />
			<Svg
				height={12}
				width={width}
				style={{ transform: [{ rotate: "180deg" }] }}
			>
				{renderZigZagView()}
			</Svg>
			<Text>I am text</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default App;
