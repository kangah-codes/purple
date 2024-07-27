import { Path, Svg, SvgProps } from "react-native-svg";

export default function ChevronDownIcon(props: SvgProps) {
	return (
		<Svg width="8" height="8" viewBox="0 0 8 8" fill="none" {...props}>
			<Path
				d="M2 3L4 5L6 3"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
