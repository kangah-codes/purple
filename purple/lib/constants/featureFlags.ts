export type FeatureFlagDefinition = {
    name: string;
    label: string;
    description: string;
    defaultEnabled: boolean;
    category: 'developer' | 'experimental' | 'beta';
};

export const FEATURE_FLAGS: readonly FeatureFlagDefinition[] = [
    {
        name: 'analytics_debug',
        label: 'Analytics Debug Tools',
        description: 'Show manual flush and clear analytics buttons in settings',
        defaultEnabled: false,
        category: 'developer',
    },
    {
        name: 'forceMigrations',
        label: 'Force Migrations',
        description: 'Force database migrations to run on app restart',
        defaultEnabled: false,
        category: 'developer',
    },
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[number]['name'];

export function getFeatureFlagDefinition(name: FeatureFlagName): FeatureFlagDefinition | undefined {
    return FEATURE_FLAGS.find((flag) => flag.name === name);
}

export function getFeatureFlagsByCategory(
    category: FeatureFlagDefinition['category'],
): FeatureFlagDefinition[] {
    return FEATURE_FLAGS.filter((flag) => flag.category === category);
}
