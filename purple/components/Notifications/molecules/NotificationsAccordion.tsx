import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { groupBy } from '@/lib/utils/helpers';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import NotificationCard from './NotificationCard';
import { formatDateTime } from '@/lib/utils/date';

export type Notification = {
    id: string;
    emoji: string;
    title: string;
    message: string;
    created_at: string;
};

type NotificationHeader = {
    groupName: string;
    notifications: (Notification & { created_at_formatted: string })[];
    id: string;
    type: 'header';
};

type NotificationItem = Notification & {
    type: 'notification';
    groupId: string;
};

type FlatListItem = NotificationHeader | NotificationItem;

type NotificationsAccordionProps = {
    notifications: Notification[];
    title?: string;
    onEndReached?: () => void;
    showTitle?: boolean;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
};

export default function NotificationsAccordion({
    notifications,
    title,
    onEndReached,
    showTitle = true,
    onScroll,
    scrollEventThrottle = 16,
}: NotificationsAccordionProps) {
    const groupedNotificationData = useMemo(() => {
        const notificationsWithFormattedDate = notifications.map((notification) => ({
            ...notification,
            created_at_formatted: formatDateTime(notification.created_at, true).date,
        }));

        return Object.entries(groupBy(notificationsWithFormattedDate, 'created_at_formatted'))
            .map(([key, value]) => {
                return {
                    groupName: key,
                    notifications: value,
                    id: key,
                };
            })
            .filter((item) => item.notifications && item.notifications.length > 0)
            .sort((a, b) => {
                const dateA = new Date(a.notifications[0].created_at);
                const dateB = new Date(b.notifications[0].created_at);
                return dateB.getTime() - dateA.getTime();
            })
            .flatMap((group): FlatListItem[] => [
                { ...group, type: 'header' as const },
                ...group.notifications.map(
                    (notification): FlatListItem => ({
                        ...notification,
                        type: 'notification' as const,
                        groupId: group.id,
                    }),
                ),
            ]);
    }, [notifications]);

    const renderItem = useCallback(({ item }: { item: FlatListItem }) => {
        if (item.type === 'header') {
            return (
                <View className='flex flex-row items-center justify-between py-2.5 px-5'>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {item.groupName}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {item.notifications.length} notification
                        {item.notifications.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            );
        }

        return (
            <View className='px-5 mb-2.5'>
                <NotificationCard emoji={item.emoji} title={item.title} message={item.message} />
            </View>
        );
    }, []);

    const renderEmptyList = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    image={require('@/assets/images/graphics/21.png')}
                    message="You don't have any notifications yet."
                />
            </View>
        ),
        [],
    );

    return (
        <View style={{ flex: 1, marginTop: showTitle ? 20 : 0 }}>
            {showTitle && (
                <View className='px-5 mb-2.5'>
                    <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                        {title ?? 'Notifications'}
                    </Text>
                </View>
            )}

            <FlashList
                estimatedItemSize={96}
                data={groupedNotificationData}
                renderItem={renderItem}
                keyExtractor={(item) =>
                    item.type === 'header' ? `header-${item.id}` : `notification-${item.id}`
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyList}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                onScroll={onScroll}
                scrollEventThrottle={scrollEventThrottle}
                ListHeaderComponent={() => <View className='h-2.5' />}
            />
        </View>
    );
}
