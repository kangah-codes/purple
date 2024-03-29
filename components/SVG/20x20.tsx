import { Path, Svg, SvgProps } from "react-native-svg";

export function DotsVerticalIcon(props: SvgProps) {
	return (
		<Svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
			<Path
				d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 9.99992C10.8333 9.53968 10.4602 9.16659 10 9.16659C9.53977 9.16659 9.16667 9.53968 9.16667 9.99992C9.16667 10.4602 9.53977 10.8333 10 10.8333Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 4.99992C10.4602 4.99992 10.8333 4.62682 10.8333 4.16659C10.8333 3.70635 10.4602 3.33325 10 3.33325C9.53977 3.33325 9.16667 3.70635 9.16667 4.16659C9.16667 4.62682 9.53977 4.99992 10 4.99992Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 16.6666C10.4602 16.6666 10.8333 16.2935 10.8333 15.8333C10.8333 15.373 10.4602 14.9999 10 14.9999C9.53977 14.9999 9.16667 15.373 9.16667 15.8333C9.16667 16.2935 9.53977 16.6666 10 16.6666Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
