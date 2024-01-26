import { styled } from "nativewind";
import {
	SafeAreaView as _SafeAreaView,
	View as _View,
	Text as _Text,
} from "react-native";

/**
 * @description Themed text component with suprapower font
 * @param {_Text["props"]} props Text component props
 * @returns {JSX.Element} Themed text component
 */
function _SuprapowerText(props: _Text["props"]) {
	return (
		<_Text {...props} style={[props.style, { fontFamily: "Suprapower" }]} />
	);
}

/**
 * @description Themed text component with inter font
 * @param {_Text["props"]} props Text component props
 * @returns {JSX.Element} Themed text component
 */
function _InterText(props: _Text["props"]) {
	return <_Text {...props} style={[props.style, { fontFamily: "Inter" }]} />;
}

export const SafeAreaView = styled(_SafeAreaView);
export const View = styled(_View);
export const SuprapowerText = styled(_SuprapowerText);
export const InterText = styled(_InterText);
