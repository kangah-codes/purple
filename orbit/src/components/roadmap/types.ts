export type RoadmapItem = {
    id: number;
    title: string;
    description: string;
    timeline: string;
    type: 'new-feature' | 'quality-of-life' | 'performance' | 'security';
    status: 'in-progress' | 'planned' | 'completed';
    isPriority?: boolean;
};
