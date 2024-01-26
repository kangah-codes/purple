import { styled } from "nativewind";
import {
	SafeAreaView as _SafeAreaView,
	View as _View,
	Text as _Text,
	TextInput as _TextInput,
} from "react-native";

/**
 * @description Themed text component with suprapower font
 * @param {_Text["props"]} props Text component props
 * @returns {JSX.Element} Themed text component
 */
function _UnstyledText(props: _Text["props"]) {
	return <_Text {...props} style={[props.style]} />;
}

function UnstyledTextInput(props: _TextInput["props"]) {
	return <_TextInput {...props} style={[props.style]} />;
}

export const SafeAreaView = styled(_SafeAreaView);
export const View = styled(_View);
export const Text = styled(_UnstyledText);
export const InputField = styled(UnstyledTextInput);
