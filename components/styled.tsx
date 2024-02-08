import { styled } from "nativewind";
import {
	SafeAreaView as _SafeAreaView,
	View as _View,
	Text as _Text,
	TextInput as _TextInput,
	ScrollView as _ScrollView,
	TouchableOpacity as _TouchableOpacity,
} from "react-native";
import { LinearGradient as _LinearGradient } from "expo-linear-gradient";
import { BottomSheetModal as _BottomSheetModal } from "@gorhom/bottom-sheet";

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
export const ScrollView = styled(_ScrollView);
export const LinearGradient = styled(_LinearGradient);
export const TouchableOpacity = styled(_TouchableOpacity);
export const BottomSheetModal = styled(_BottomSheetModal);
