import Avatar from "@/components/Shared/Atoms/Avatar";
import { Text, View } from "@/components/styled";

export default function ProfileHeader() {
	return (
		<View className="flex items-center justify-center space-y-5">
			<Avatar colour="purple" content="JA" size="xl" />

			<View className="flex flex-col items-center">
				<Text style={{ fontFamily: "Suprapower" }} className="text-2xl">
					Joshua Akangah
				</Text>
				<Text
					style={{ fontFamily: "InterMedium" }}
					className="text-base text-gray-500 tracking-tighter"
				>
					akangah89@gmail.com
				</Text>
			</View>
		</View>
	);
}
