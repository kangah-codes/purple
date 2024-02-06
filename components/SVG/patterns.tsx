import * as React from "react";
import { Dimensions } from "react-native";
import Svg, { ClipPath, Path, G, SvgProps } from "react-native-svg";

export default function LinePattern(props: SvgProps) {
	return (
		<Svg
			// xmlns="http://www.w3.org/2000/svg"
			fill="none"
			height={50}
			viewBox="0 0 1800 543"
			width={1800}
			{...props}
			style={{
				position: "absolute",
			}}
		>
			<ClipPath id="a">
				<Path d="M0 362h209v181H0z" />
			</ClipPath>
			<ClipPath id="b">
				<Path d="M1382 362h209v181h-209z" />
			</ClipPath>
			<ClipPath>
				<Path d="M1591 362h209v181h-209z" />
			</ClipPath>
			<G fill="#FF8200">
				<Path d="M62.504 181L0 144.915v1.684L59.584 181zm-34.835 0L0 165.026v1.684L24.754 181zm-17.415 0L0 175.079v1.684L7.339 181zm69.44-.13L0 134.862v1.684L76.998 181h2.92zm-34.61.13L0 154.973v1.684L42.164 181zm52.035-.13L0 124.799v1.684L94.429 181h2.915zM104.833 156.566L209 96.418v-1.679l-.075.044L104.5 155.067 0 94.734v1.684l104.127 60.118a.731.731 0 00.699.03zm.032-20.13L209 76.312v-1.679l-.075.043-104.425 60.28L0 74.617v1.684l104.127 60.123a.647.647 0 00.292.094.701.701 0 00.446-.082zm-.032 10.072L209 86.365v-1.679l-.075.043-104.42 60.285L0 84.676v1.684l104.127 60.118a.731.731 0 00.699.03zm.035 30.149L209 116.529v-1.679l-.075.044-104.42 60.29L0 114.845v1.684l104.18 60.148a.738.738 0 00.646 0h.002zm.001-50.281L209 66.253v-1.678l-.075.043-104.425 60.28L0 64.564v1.684l104.127 60.118a.744.744 0 00.742.01zm-.036 40.243L209 106.476v-1.678l-.075.043L104.5 165.125 0 104.787v1.689l104.18 60.143a.75.75 0 00.646 0zM393.351 0h-2.952L209 104.731v1.704L393.126.13zm17.191.13L209 116.491v-1.704L407.816 0h2.951zm-52.25 0L209 86.325v-1.704L355.566 0h2.951zm17.417 0L209 96.38v-1.703L372.983 0h2.951zm-34.833 0L209 76.27v-1.705L338.149 0h2.952zm-17.417 0L209 66.215V64.51L320.733 0h2.951zM233.649 181h2.952L418 76.269v-1.705L233.874 180.87zm-17.191-.131L418 64.509v1.704L219.184 181h-2.951zm52.25 0L418 94.675v1.704L271.434 181h-2.951zm-17.417 0L418 84.619v1.704L254.017 181h-2.951zm34.833 0L418 104.73v1.705L288.851 181h-2.952zm17.417 0L418 114.785v1.704L306.267 181h-2.951zM1406.65 0h2.95L1591 104.731v1.704L1406.87.13zm-17.19.13L1591 116.491v-1.704L1392.18 0h-2.95zm52.25 0L1591 86.325v-1.704L1444.43 0h-2.95zm-17.42 0L1591 96.38v-1.703L1427.02 0h-2.95zm34.83 0L1591 76.27v-1.705L1461.85 0h-2.95zm17.42 0L1591 66.215V64.51L1479.27 0h-2.95zM1566.35 181h-2.95L1382 76.269v-1.705l184.13 106.305zm17.19-.131L1382 64.509v1.704L1580.82 181h2.95zm-52.25 0L1382 94.675v1.704L1528.57 181h2.95zm17.42 0L1382 84.619v1.704L1545.98 181h2.95zm-34.83 0L1382 104.73v1.705L1511.15 181h2.95zm-17.42 0L1382 114.785v1.704L1493.73 181h2.95zM1653.5 181l-62.5-36.085v1.684L1650.58 181zm-34.83 0L1591 165.026v1.684l24.75 14.29zm-17.42 0l-10.25-5.921v1.684l7.34 4.237zm69.44-.13L1591 134.862v1.684L1668 181h2.92zm-34.61.13L1591 154.973v1.684L1633.16 181zm52.04-.13L1591 124.799v1.684L1685.43 181h2.91zM1695.83 156.566L1800 96.418v-1.679l-.07.044-104.43 60.284L1591 94.734v1.684l104.13 60.118c.1.063.22.099.34.104s.25-.02.36-.074zm.03-20.13L1800 76.312v-1.679l-.07.043-104.43 60.28L1591 74.617v1.684l104.13 60.123c.05.03.1.053.15.069a.53.53 0 00.14.025.68.68 0 00.44-.082zm-.03 10.072L1800 86.365v-1.679l-.07.043-104.42 60.285L1591 84.676v1.684l104.13 60.118c.1.063.22.099.34.104s.25-.02.36-.074zm.04 30.149L1800 116.529v-1.679l-.07.044-104.42 60.29L1591 114.845v1.684l104.18 60.148c.1.049.21.074.32.074s.23-.025.33-.074zm0-50.281L1800 66.253v-1.678l-.07.043-104.43 60.28L1591 64.564v1.684l104.13 60.118a.738.738 0 00.74.01zm-.04 40.243L1800 106.476v-1.678l-.07.043-104.43 60.284-104.5-60.338v1.689l104.18 60.143a.743.743 0 00.65 0zM10.254 181L0 186.921v-1.684L7.339 181zm17.415 0L0 196.974v-1.684L24.754 181zm69.674 0L.075 237.158l-.075.043v-1.684L94.429 181zm-17.425 0L.075 227.094l-.075.044v-1.684L76.998 181zm-34.834 0L0 207.026v-1.683L42.163 181zm17.42 0L0 217.085v-1.684L59.584 181zM.075 307.351l-.075.043v-1.679l104.136-60.13a.794.794 0 01.363-.091.71.71 0 01.363.093L209 305.716v1.684l-104.506-60.339zm0 10.053l-.075.043v-1.678l104.11-60.11.021-.013a.733.733 0 01.731 0L209 315.769v1.689l-104.501-60.339zm0 10.058l-.075.043v-1.678l104.137-60.132a.801.801 0 01.362-.09c.128 0 .253.034.363.099L209 325.827v1.684l-104.506-60.339zm0 10.053l-.075.043v-1.679l104.137-60.126a.801.801 0 01.362-.09.71.71 0 01.363.093L209 335.885v1.684L104.494 277.23zm0 20.111L0 357.67v-1.679l104.132-60.123.1-.05.007.006a.682.682 0 01.26-.049.702.702 0 01.363.098L209 355.996v1.684l-104.501-60.334zm0-10.059l-.075.044v-1.678l104.136-60.126a.794.794 0 01.363-.091c.128 0 .253.034.363.099L209 345.938v1.69l-104.501-60.34zM1695.83 337.566L1800 277.418v-1.678l-.07.043-104.43 60.284-104.5-60.333v1.684l104.13 60.118c.1.063.22.099.34.104s.25-.02.36-.074zm.03-20.13L1800 257.312v-1.679l-.07.043-104.43 60.28-104.5-60.339v1.685l104.13 60.122c.05.03.1.053.15.069a.53.53 0 00.14.025.68.68 0 00.44-.082zm-.03 10.072L1800 267.365v-1.679l-.07.043-104.42 60.285L1591 265.676v1.684l104.13 60.118c.1.063.22.099.34.104s.25-.02.36-.074zm.04 30.149L1800 297.529v-1.679l-.07.044-104.42 60.29L1591 295.845v1.684l104.18 60.148c.1.049.21.074.32.074s.23-.025.33-.074zm0-50.281L1800 247.254v-1.679l-.07.043-104.43 60.28-104.5-60.334v1.684l104.13 60.118a.738.738 0 00.74.01zm-.04 40.243L1800 287.476v-1.678l-.07.043-104.43 60.284-104.5-60.338v1.689l104.18 60.143a.743.743 0 00.65 0zM1653.5 181l-62.5 36.085v-1.684L1650.58 181zm-34.83 0L1591 196.974v-1.684l24.75-14.29zm-17.42 0l-10.25 5.921v-1.684l7.34-4.237zm69.44.13L1591 227.138v-1.684L1668 181h2.92zm-34.61-.13L1591 207.027v-1.684L1633.16 181zm52.04.13L1591 237.201v-1.684L1685.43 181h2.91z" />
				<G clipPath="url(#a)">
					<Path d="M111.732 543h2.952L209 488.546v-1.704l-97.043 56.028zm87.084 0L209 537.119v1.704L201.767 543zm-69.442-.13L209 496.897v1.705L132.1 543h-2.951zm17.416 0L209 506.952v1.704L149.517 543h-2.952zm34.834 0L209 527.063v1.705L184.35 543h-2.951zm-17.417 0L209 517.008v1.704L166.933 543h-2.951zM208.925 406.441L0 527.065v1.703l.075-.043L209 408.103v-1.706zm.075-10.098v1.704L.075 518.67l-.075.044v-1.704l208.925-120.624zm0 20.11v1.705L.075 538.781l-.075.043v-1.703l208.925-120.624zm0-30.166v1.704L.075 508.615l-.075.043v-1.704l208.925-120.623zm0-10.056v1.705L.075 498.559l-.075.043v-1.704l208.925-120.623zm0-10.055v1.704L.075 488.503l-.075.044v-1.704l208.925-120.624z" />
				</G>
				<Path d="M209.075 406.441L418 527.065v1.704l-.075-.044L209 408.103v-1.706zM209 396.343v1.704L417.925 518.67l.075.044v-1.704L209.075 396.386zm0 20.11v1.705l208.925 120.623.075.043v-1.703L209.075 416.497zm0-30.166v1.704l208.925 120.624.075.043v-1.704L209.075 386.331zm0-10.056v1.705l208.925 120.623.075.044v-1.705L209.075 376.275zm0-10.055v1.704l208.925 120.623.075.044v-1.704L209.075 366.219z" />
				<G clipPath="url(#b)">
					<Path d="M1493.73 543h2.95l94.32-54.454v-1.704l-97.04 56.028zm87.09 0l10.18-5.881v1.704l-7.23 4.177zm-69.45-.13l79.63-45.973v1.705L1514.1 543h-2.95zm17.42 0l62.21-35.918v1.704L1531.52 543h-2.95zm34.83 0l27.38-15.807v1.705L1566.35 543h-2.95zm-17.41 0l44.79-25.862v1.704L1548.93 543h-2.95zM1590.92 406.441L1382 527.065v1.703l.08-.043L1591 408.103v-1.706zm.08-10.098v1.704L1382.08 518.67l-.08.044v-1.704l208.92-120.624zm0 20.11v1.705l-208.92 120.623-.08.043v-1.703l208.92-120.624zm0-30.166v1.704l-208.92 120.624-.08.043v-1.704l208.92-120.623zm0-10.056v1.705l-208.92 120.623-.08.043v-1.704l208.92-120.623zm0-10.055v1.704l-208.92 120.623-.08.044v-1.704l208.92-120.624z" />
				</G>
				<G clipPath="url(c)">
					<Path d="M1702.73 543h2.95l94.32-54.454v-1.704l-97.04 56.028zm87.09 0l10.18-5.881v1.704l-7.23 4.177zm-69.45-.13l79.63-45.973v1.705L1723.1 543h-2.95zm17.42 0l62.21-35.918v1.704L1740.52 543h-2.95zm34.83 0l27.38-15.807v1.705L1775.35 543h-2.95zm-17.41 0l44.79-25.862v1.704L1757.93 543h-2.95zM1799.92 406.441L1591 527.065v1.703l.08-.043L1800 408.103v-1.706zm.08-10.098v1.704L1591.08 518.67l-.08.044v-1.704l208.92-120.624zm0 20.11v1.705l-208.92 120.623-.08.043v-1.703l208.92-120.624zm0-30.166v1.704l-208.92 120.624-.08.043v-1.704l208.92-120.623zm0-10.056v1.705l-208.92 120.623-.08.043v-1.704l208.92-120.623zm0-10.055v1.704l-208.92 120.623-.08.044v-1.704l208.92-120.624z" />
				</G>
			</G>
		</Svg>
	);
}
