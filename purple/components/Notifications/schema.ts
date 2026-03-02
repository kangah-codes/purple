import { z } from 'zod';

export const NotificationSchema = z.object({
    id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable().optional(),
    user_id: z.string(),
    title: z.string(),
    message: z.string(),
    emoji: z.string().optional(),
    type: z.enum(['payment', 'system', 'budget', 'reminder', 'feature']),
    category: z.string().optional(),
    is_read: z.boolean().default(false),
    action_url: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    metadata: z.string().optional(),
});

export const CreateNotificationSchema = NotificationSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
});

export const UpdateNotificationSchema = CreateNotificationSchema.partial();

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
