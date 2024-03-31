import { ClipPath, Defs, G, Path, Rect, Svg, SvgProps } from "react-native-svg";

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

export function DotsVerticalIcon(props: SvgProps) {
	return (
		<Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
			<Path
				d="M7.99999 8.66675C8.36818 8.66675 8.66666 8.36827 8.66666 8.00008C8.66666 7.63189 8.36818 7.33341 7.99999 7.33341C7.63181 7.33341 7.33333 7.63189 7.33333 8.00008C7.33333 8.36827 7.63181 8.66675 7.99999 8.66675Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.99999 4.00008C8.36818 4.00008 8.66666 3.7016 8.66666 3.33341C8.66666 2.96522 8.36818 2.66675 7.99999 2.66675C7.63181 2.66675 7.33333 2.96522 7.33333 3.33341C7.33333 3.7016 7.63181 4.00008 7.99999 4.00008Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.99999 13.3334C8.36818 13.3334 8.66666 13.0349 8.66666 12.6667C8.66666 12.2986 8.36818 12.0001 7.99999 12.0001C7.63181 12.0001 7.33333 12.2986 7.33333 12.6667C7.33333 13.0349 7.63181 13.3334 7.99999 13.3334Z"
				stroke={props.stroke}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function StarsIcon(props: SvgProps) {
	return (
		<Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
			<G clipPath="url(#clip0_251_8519)">
				<Path
					d="M4.33337 8.66683L4.85635 9.71277C5.03334 10.0668 5.12184 10.2438 5.24006 10.3971C5.34497 10.5332 5.46698 10.6552 5.60308 10.7601C5.75645 10.8784 5.93344 10.9669 6.28743 11.1439L7.33337 11.6668L6.28743 12.1898C5.93344 12.3668 5.75645 12.4553 5.60308 12.5735C5.46698 12.6784 5.34497 12.8004 5.24006 12.9365C5.12184 13.0899 5.03334 13.2669 4.85635 13.6209L4.33337 14.6668L3.8104 13.6209C3.63341 13.2669 3.54491 13.0899 3.42669 12.9365C3.32178 12.8004 3.19977 12.6784 3.06367 12.5735C2.9103 12.4553 2.7333 12.3668 2.37932 12.1898L1.33337 11.6668L2.37932 11.1439C2.7333 10.9669 2.9103 10.8784 3.06367 10.7601C3.19977 10.6552 3.32178 10.5332 3.42669 10.3971C3.54491 10.2438 3.63341 10.0668 3.8104 9.71277L4.33337 8.66683Z"
					stroke={props.stroke}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M10 1.3335L10.7858 3.37644C10.9738 3.86526 11.0678 4.10967 11.214 4.31526C11.3435 4.49746 11.5027 4.65666 11.6849 4.78622C11.8905 4.9324 12.1349 5.02641 12.6238 5.21441L14.6667 6.00016L12.6238 6.78591C12.1349 6.97392 11.8905 7.06792 11.6849 7.21411C11.5027 7.34367 11.3435 7.50286 11.214 7.68507C11.0678 7.89065 10.9738 8.13506 10.7858 8.62388L10 10.6668L9.21429 8.62388C9.02628 8.13506 8.93228 7.89065 8.7861 7.68507C8.65654 7.50286 8.49734 7.34367 8.31513 7.21411C8.10955 7.06792 7.86514 6.97392 7.37632 6.78591L5.33337 6.00016L7.37632 5.21441C7.86514 5.02641 8.10955 4.9324 8.31513 4.78622C8.49734 4.65666 8.65654 4.49746 8.7861 4.31526C8.93228 4.10967 9.02628 3.86526 9.21429 3.37644L10 1.3335Z"
					stroke={props.stroke}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</G>
			<Defs>
				<ClipPath id="clip0_251_8519">
					<Rect width="16" height="16" fill="white" />
				</ClipPath>
			</Defs>
		</Svg>
	);
}
