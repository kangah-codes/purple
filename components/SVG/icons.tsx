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

export function EyeOpenIcon(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			{...props}
		>
			<Path
				d="M1.61342 8.47549C1.52262 8.33173 1.47723 8.25985 1.45182 8.14898C1.43273 8.06571 1.43273 7.93437 1.45182 7.8511C1.47723 7.74023 1.52262 7.66835 1.61341 7.52459C2.36369 6.3366 4.59693 3.33337 8.00027 3.33337C11.4036 3.33337 13.6369 6.3366 14.3871 7.52459C14.4779 7.66835 14.5233 7.74023 14.5487 7.8511C14.5678 7.93437 14.5678 8.06571 14.5487 8.14898C14.5233 8.25985 14.4779 8.33173 14.3871 8.47549C13.6369 9.66348 11.4036 12.6667 8.00027 12.6667C4.59693 12.6667 2.36369 9.66348 1.61342 8.47549Z"
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
			/>
			<Path
				d="M8.00027 10C9.10484 10 10.0003 9.10461 10.0003 8.00004C10.0003 6.89547 9.10484 6.00004 8.00027 6.00004C6.8957 6.00004 6.00027 6.89547 6.00027 8.00004C6.00027 9.10461 6.8957 10 8.00027 10Z"
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
			/>
		</Svg>
	);
}

export function EyeCloseIcon(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			{...props}
		>
			<Path
				d="M7.16196 3.39488C7.4329 3.35482 7.7124 3.33333 8.00028 3.33333C11.4036 3.33333 13.6369 6.33656 14.3871 7.52455C14.4779 7.66833 14.5233 7.74023 14.5488 7.85112C14.5678 7.93439 14.5678 8.06578 14.5487 8.14905C14.5233 8.25993 14.4776 8.3323 14.3861 8.47705C14.1862 8.79343 13.8814 9.23807 13.4777 9.7203M4.48288 4.47669C3.0415 5.45447 2.06297 6.81292 1.61407 7.52352C1.52286 7.66791 1.47725 7.74011 1.45183 7.85099C1.43273 7.93426 1.43272 8.06563 1.45181 8.14891C1.47722 8.25979 1.52262 8.33168 1.61342 8.47545C2.36369 9.66344 4.59694 12.6667 8.00028 12.6667C9.37255 12.6667 10.5546 12.1784 11.5259 11.5177M2.00028 2L14.0003 14M6.58606 6.58579C6.22413 6.94772 6.00028 7.44772 6.00028 8C6.00028 9.10457 6.89571 10 8.00028 10C8.55256 10 9.05256 9.77614 9.41449 9.41421"
				stroke={props.stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={props.strokeWidth ?? 2}
			/>
		</Svg>
	);
}

export function ArrowNarrowDownRightIcon(props: SvgProps) {
	return (
		<Svg fill="none" {...props}>
			<Path
				d="M4 4L12 12M12 12V6.66667M12 12H6.66667"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
