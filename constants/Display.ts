import DeviceInfo from "react-native-device-info";

// determine whether the phone has a notch or hole punch
export const hasNotch = DeviceInfo.hasNotch() || DeviceInfo.hasDynamicIsland();
