import { View } from '@/components/Shared/styled';
import MegaphoneIcon, { SettingsCogIcon, ShieldTickIcon } from '@/components/SVG/24x24';
import { UserCircleIcon } from '@/components/SVG/noscale';
import { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { ProfilePageLinkProps } from '../schema';
import ProfilePageLink from './ProfilePageLink';
import { keyExtractor } from '@/lib/utils/number';

const profilePages: ProfilePageLinkProps[] = [
    {
        icon: <UserCircleIcon width={20} height={20} stroke={'#9333ea'} />,
        title: 'My Account',
        link: '/lkol',
    },
    {
        icon: <ShieldTickIcon width={20} height={20} stroke={'#9333ea'} />,
        title: 'Security',
        link: '/lkol',
    },
    {
        icon: <SettingsCogIcon width={20} height={20} stroke={'#9333ea'} />,
        title: 'Settings',
        link: '/lkol',
    },
    {
        icon: <MegaphoneIcon width={20} height={20} stroke={'#9333ea'} />,
        title: 'Notifications',
        link: '/lkol',
    },
];

export default function ProfilePages() {
    const renderItem: ListRenderItem<ProfilePageLinkProps> = useCallback(
        ({ item }) => <ProfilePageLink icon={item.icon} title={item.title} link={item.link} />,
        [],
    );
    const itemSeparator = useCallback(() => <View className='border-b border-gray-100 h-1' />, []);

    return (
        <View className='flex items-center justify-center space-y-5 px-5'>
            <FlatList
                data={profilePages}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                scrollEnabled={true}
                ItemSeparatorComponent={itemSeparator}
            />
        </View>
    );
}
