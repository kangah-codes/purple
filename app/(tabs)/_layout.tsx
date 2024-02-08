import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import {
	ArrowSwitchHorizontalIcon,
	BarLineChartIcon,
	CoinSwapIcon,
	HomeSmileIcon,
	PiggyBankIcon,
	SafeIcon,
	UserCircleIcon,
	WalletIcon,
} from "@/components/SVG/icons";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors["light"].tint,
				tabBarLabelStyle: {
					marginTop: -5, // do this so that on certain android phones it looks better
					marginBottom: 5,
					fontFamily: "InterSemiBold",
				},
				tabBarStyle: [
					{
						backgroundColor: "#F9F9F9",
					},
				],
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<HomeSmileIcon width={24} height={24} stroke={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="plans"
				options={{
					title: "Plans",
					tabBarIcon: ({ color }) => (
						<PiggyBankIcon width={24} height={24} stroke={color} />
					),
					headerShown: false,
					// tabBarBadge: "9+",
				}}
			/>
			<Tabs.Screen
				name="transactions"
				options={{
					title: "Transactions",
					tabBarIcon: ({ color }) => (
						<CoinSwapIcon width={24} height={24} stroke={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="stats"
				options={{
					title: "Stats",
					tabBarIcon: ({ color }) => (
						<BarLineChartIcon
							width={24}
							height={24}
							stroke={color}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="accounts"
				options={{
					title: "Accounts",
					tabBarIcon: ({ color }) => (
						<SafeIcon width={24} height={24} stroke={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<UserCircleIcon width={24} height={24} stroke={color} />
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
