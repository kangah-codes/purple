import DatePicker from "@/components/Shared/atoms/DatePicker";
import SelectField from "@/components/Shared/atoms/SelectField";
import {
	InputField,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import { router } from "expo-router";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { useState } from "react";
import {
	ActivityIndicator,
	Platform,
	StatusBar as RNStatusBar,
	Switch,
} from "react-native";

export default function NewPlanScreen() {
	const [isEnabled, setIsEnabled] = useState(false);
	const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			{/* <Stack.Screen
				options={{
					headerStyle: {
						backgroundColor: "#fff",
					},
					headerTitleStyle: {
						fontFamily: "Suprapower",
					},
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<ChevronLeftIcon stroke="#000" />
						</TouchableOpacity>
					),
					headerTitle: "New Plan",
					headerTitleAlign: "center",
					headerShown: true,
				}}
			/> */}
			<SafeAreaView
				className="bg-white relative h-full"
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
			>
				<ExpoStatusBar style="dark" />
				<View className="w-full flex flex-row px-5 py-2.5 justify-between items-center">
					<View className="flex flex-col">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							New Plan
						</Text>
					</View>

					<TouchableOpacity onPress={() => router.back()}>
						<Text
							style={{ fontFamily: "InterSemiBold" }}
							className="text-purple-600"
						>
							Cancel
						</Text>
					</TouchableOpacity>
				</View>
				<ScrollView
					className="space-y-5 flex-1 flex flex-col p-5"
					contentContainerStyle={{
						paddingBottom: 100,
					}}
				>
					<View className="flex flex-col space-y-1">
						<Text
							style={{ fontFamily: "InterBold" }}
							className="text-xs text-gray-500"
						>
							Plan Name
						</Text>

						<InputField
							className="bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900"
							style={{ fontFamily: "InterSemiBold" }}
							cursorColor={"#8B5CF6"}
						/>
					</View>

					<View>
						<SelectField
							selectKey="newPlanType"
							label="Plan Type"
							options={{
								expense: {
									label: "💸   Expense",
									value: "expense",
								},
								saving: {
									label: "💰   Saving",
									value: "saving",
								},
							}}
							customSnapPoints={["25%", "25%"]}
							renderItem={(item) => (
								<View className="py-3 border-b border-gray-100">
									<Text>{item.label}</Text>
								</View>
							)}
						/>
					</View>

					<View>
						<SelectField
							selectKey="newPlanCategory"
							label="Category"
							options={{
								kanye: {
									label: "Kanye",
									value: "kanye",
								},
								rihanna: {
									label: "Rihanna",
									value: "rihanna",
								},
								drake: {
									label: "Drake",
									value: "drake",
								},
							}}
							customSnapPoints={["30%", "40%"]}
						/>
					</View>

					<View className="flex flex-col space-y-1">
						<Text
							style={{ fontFamily: "InterBold" }}
							className="text-xs text-gray-500"
						>
							Amount
						</Text>

						<InputField
							className="bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900"
							style={{ fontFamily: "InterSemiBold" }}
							cursorColor={"#8B5CF6"}
							placeholder="0.00"
						/>
					</View>

					<View>
						<SelectField
							selectKey="newPlanAccount"
							label="Account"
							options={{
								weekly: {
									label: "Weekly",
									value: "weekly",
								},
								"bi-weekly": {
									label: "Bi-Weekly",
									value: "bi-weekly",
								},
								monthly: {
									label: "Monthly",
									value: "monthly",
								},
							}}
							customSnapPoints={["30%", "30%"]}
						/>
					</View>

					<View className="h-1 border-b border-gray-100 w-full" />

					{/* <Text
					style={{ fontFamily: "Suprapower" }}
					className="text-base text-black"
				>
					Plan Details
				</Text> */}

					<View className="flex flex-col space-y-1">
						<DatePicker
							label="Start Date"
							pickerKey="newPlanStartDate"
						/>
					</View>

					<View className="flex flex-col space-y-1">
						<DatePicker
							label="End Date"
							pickerKey="newPlanEndDate"
						/>
					</View>

					<View className="h-1 border-b border-gray-100 w-full" />

					<View>
						<SelectField
							selectKey="newPlanDepositFrequency"
							label="Deposit Frequency"
							options={{
								weekly: {
									label: "Weekly",
									value: "weekly",
								},
								"bi-weekly": {
									label: "Bi-Weekly",
									value: "bi-weekly",
								},
								monthly: {
									label: "Monthly",
									value: "monthly",
								},
							}}
							customSnapPoints={["30%", "30%"]}
						/>
					</View>

					<View className="flex flex-row justify-between items-center">
						<Text
							style={{ fontFamily: "InterBold" }}
							className="text-xs text-gray-500"
						>
							Send me reminders
						</Text>

						<Switch
							trackColor={{ false: "#767577", true: "#8B5CF6" }}
							thumbColor={"#f4f3f4"}
							ios_backgroundColor="#3e3e3e"
							onValueChange={toggleSwitch}
							value={isEnabled}
							style={{
								transform:
									Platform.OS === "ios"
										? [{ scaleX: 0.8 }, { scaleY: 0.8 }]
										: [],
							}}
						/>
					</View>
				</ScrollView>

				<TouchableOpacity
					onPress={() => {
						setIsLoading(true);
						setTimeout(() => {
							setIsLoading(false);
						}, 3000);
					}}
					disabled={isLoading}
					className="items-center self-center w-[95%] justify-center px-4 absolute bottom-8"
				>
					<View className="bg-purple-600 py-4 w-full flex items-center justify-center rounded-full">
						{isLoading ? (
							<ActivityIndicator size={18} color="#fff" />
						) : (
							<Text
								style={{
									fontFamily: "Suprapower",
								}}
								className="text-white"
							>
								Create Plan
							</Text>
						)}
					</View>
				</TouchableOpacity>
			</SafeAreaView>
		</>
	);
}
