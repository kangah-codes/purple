import { Slot, Stack } from "expo-router";

export default function Accounts() {
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
