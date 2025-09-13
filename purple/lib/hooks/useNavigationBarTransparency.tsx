import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

export const useNavigationBarTransparency = (isActive: boolean) => {
    useEffect(() => {
        if (isActive) {
            NavigationBar.setPositionAsync('absolute');
            NavigationBar.setBackgroundColorAsync('transparent');
        }
    }, [isActive]);
};
