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

export function ChevronDownIcon(props: SvgProps) {
	return (
		<Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
			<Path
				d="M4 6L8 10L12 6"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function CalendarIcon(props: SvgProps) {
	return (
		<Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
			<Path
				d="M14 6.66683H2M10.6667 1.3335V4.00016M5.33333 1.3335V4.00016M5.2 14.6668H10.8C11.9201 14.6668 12.4802 14.6668 12.908 14.4488C13.2843 14.2571 13.5903 13.9511 13.782 13.5748C14 13.147 14 12.5869 14 11.4668V5.86683C14 4.74672 14 4.18667 13.782 3.75885C13.5903 3.38252 13.2843 3.07656 12.908 2.88482C12.4802 2.66683 11.9201 2.66683 10.8 2.66683H5.2C4.0799 2.66683 3.51984 2.66683 3.09202 2.88482C2.71569 3.07656 2.40973 3.38252 2.21799 3.75885C2 4.18667 2 4.74672 2 5.86683V11.4668C2 12.5869 2 13.147 2.21799 13.5748C2.40973 13.9511 2.71569 14.2571 3.09202 14.4488C3.51984 14.6668 4.0799 14.6668 5.2 14.6668Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
