import { Path, Svg, SvgProps } from "react-native-svg";

export function ChevronRightIcon(props: SvgProps) {
	return (
		<Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
			<Path
				d="M6 12L10 8L6 4"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
