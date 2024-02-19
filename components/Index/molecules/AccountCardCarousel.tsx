import { View } from "@/components/Shared/styled";
import { useState } from "react";
import { Dimensions } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import AccountCard from "./AccountCard";

const data = [
	{
		accountCurrency: "GHS",
		accountBalance: 120000,
		accountName: "Fidelity Bank Account",
		cardBackgroundColour: "#FB923C",
		cardTintColour: "#FED7AA",
	},
	{
		accountCurrency: "GHS",
		accountBalance: 98994329,
		accountName: "MTN MoMo",
		cardBackgroundColour: "#FACC15",
		cardTintColour: "#FEF9C3",
	},
	{
		accountCurrency: "GHS",
		accountBalance: 98994329,
		accountName: "Prepaid Card",
		cardBackgroundColour: "#FACC15",
		cardTintColour: "#FEF9C3",
	},
	{
		accountCurrency: "GHS",
		accountBalance: 98994329,
		accountName: "MTN MoMo",
		cardBackgroundColour: "#FACC15",
		cardTintColour: "#FEF9C3",
	},
];

export default function AccountCardCarousel() {
	const [entries, setEntries] = useState(data);
	const [activeSlide, setActiveSlide] = useState(0); // active slide is 0 by default

	return (
		<View>
			<Carousel
				data={data}
				renderItem={({ item }) => <AccountCard item={item} />}
				sliderWidth={Dimensions.get("window").width - 40} // Customize width as needed
				itemWidth={Dimensions.get("window").width - 40} // Customize width as needed
				layout={"default"} // 'default', 'stack', 'tinder'
				loop={true} // Set to true if you want to loop through items
				autoplay={false} // Set to true if you want automatic sliding
				style={{
					width: "100%",
				}}
				onSnapToItem={(index) => setActiveSlide(index)}
			/>

			<Pagination
				dotsLength={entries.length}
				activeDotIndex={activeSlide}
				// containerStyle={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
				dotStyle={{
					width: 10,
					height: 10,
					borderRadius: 5,
					backgroundColor: "#9333EA",
					marginHorizontal: -5, // bring the dots much closer together
				}}
				inactiveDotStyle={
					{
						// Define styles for inactive dots here
					}
				}
				inactiveDotOpacity={0.4}
				inactiveDotScale={0.6}
				containerStyle={{
					paddingTop: 20,
					paddingBottom: 0,
					paddingHorizontal: 0,
				}}
			/>
		</View>
	);
}
