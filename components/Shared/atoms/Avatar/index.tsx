import { LinearGradient, Text } from "@/components/Shared/styled";

const AvatarGradients = {
	purple: ["#C084FC", "#7E22CE"],
	rose: ["#FB7185", "#BE123C"],
	green: ["#4ADE80", "#047857"],
	yellow: ["#FACC15", "#A16207"],
};

type AvatarProps = {
	content: string;
	size: "sm" | "md" | "lg" | "xl";
	colour: keyof typeof AvatarGradients;
};

function getAvatarSize(size: AvatarProps["size"]) {
	switch (size) {
		case "sm":
			return {
				width: 40,
				height: 40,
				fontSize: 15,
			};
		case "md":
		default:
			return {
				width: 50,
				height: 50,
				fontSize: 20,
			};
		case "lg":
			return {
				width: 60,
				height: 60,
				fontSize: 25,
			};
		case "xl":
			return {
				width: 80,
				height: 80,
				fontSize: 30,
			};
	}
}

export default function Avatar(props: AvatarProps) {
	const { content, colour, size } = props;

	return (
		<LinearGradient
			className="rounded-full flex flex-col justify-center items-center relative"
			style={{ ...getAvatarSize(size) }}
			colors={AvatarGradients[colour]}
		>
			<Text
				className="text-white tracking-tighter"
				style={{
					fontFamily: "Suprapower",
					fontSize: getAvatarSize(size).fontSize,
				}}
			>
				{content}
			</Text>
		</LinearGradient>
	);
}
