import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
	name: React.ComponentProps<typeof FontAwesome>["name"];
	color: string;
}) {
	return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors["light"].tint,
				// Disable the static render of the header on web
				// to prevent a hydration error in React Navigation v6.
				headerShown: useClientOnlyValue(false, true),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Tab One",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="code" color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Tab Two",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="code" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
