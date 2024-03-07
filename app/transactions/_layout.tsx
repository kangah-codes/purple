import { Slot, Stack } from "expo-router";

export default function Plans() {
	return (
		<Stack
			screenOptions={{
				contentStyle: {
					backgroundColor: "#fff",
				},
				headerShown: false,
			}}
		/>
	);
}
