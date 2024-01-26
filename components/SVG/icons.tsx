import { Path, Svg, SvgProps } from "react-native-svg";

export function BellIcon(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			{...props}
		>
			<Path
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
				d="M10.5 15.75h-3m6-9.75a4.5 4.5 0 0 0-9 0c0 2.318-.585 3.904-1.238 4.954-.55.885-.826 1.328-.816 1.452.011.136.04.188.15.27.1.074.548.074 1.446.074h9.916c.897 0 1.346 0 1.446-.074.11-.082.139-.134.15-.27.01-.124-.265-.567-.816-1.452C14.085 9.904 13.5 8.318 13.5 6Z"
			/>
		</Svg>
	);
}

export function SearchIcon(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			{...props}
		>
			<Path
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
				d="M14 14L11.6667 11.6667M13.3333 7.66667C13.3333 10.7963 10.7963 13.3333 7.66667 13.3333C4.53705 13.3333 2 10.7963 2 7.66667C2 4.53705 4.53705 2 7.66667 2C10.7963 2 13.3333 4.53705 13.3333 7.66667Z"
			/>
		</Svg>
	);
}

export function CoinSwapIcon(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			{...props}
		>
			<Path
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
				d="M6 6L8 4M8 4L6 2M8 4H6C3.79086 4 2 5.79086 2 8M18 18L16 20M16 20L18 22M16 20H18C20.2091 20 22 18.2091 22 16M13.4172 13.4172C14.1994 13.7908 15.0753 14 16 14C19.3137 14 22 11.3137 22 8C22 4.68629 19.3137 2 16 2C12.6863 2 10 4.68629 10 8C10 8.92472 10.2092 9.80057 10.5828 10.5828M14 16C14 19.3137 11.3137 22 8 22C4.68629 22 2 19.3137 2 16C2 12.6863 4.68629 10 8 10C11.3137 10 14 12.6863 14 16Z"
			/>
		</Svg>
	);
}
