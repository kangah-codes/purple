import { Path, Svg, SvgProps } from "react-native-svg";

export default function ArrowCircleDownIcon(props: SvgProps) {
	return (
		<Svg width="28" height="28" viewBox="0 0 28 28" fill="none" {...props}>
			<Path
				d="M19.8334 3.89411C23.3205 5.91133 25.6667 9.68167 25.6667 14C25.6667 20.4433 20.4434 25.6666 14 25.6666C7.55672 25.6666 2.33337 20.4433 2.33337 14C2.33337 9.68167 4.67953 5.91133 8.16671 3.89411M9.33337 14L14 18.6666M14 18.6666L18.6667 14M14 18.6666V2.33331"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
