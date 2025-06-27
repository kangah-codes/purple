import { type RoadmapItem as TRoadmapItem } from './types';

const formatBadgeText = (type: string) => {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getBadgeColor = (type: string) => {
    switch (type) {
        case 'new-feature':
            return 'bg-green-100 text-green-800 border-green-100';
        case 'quality-of-life':
            return 'bg-blue-100 text-blue-800 border-blue-100';
        case 'performance':
            return 'bg-orange-100 text-orange-800 border-orange-100';
        case 'security':
            return 'bg-red-100 text-red-800 border-red-100';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-100';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'in-progress':
            return 'bg-yellow-100 text-yellow-800 border-yellow-100';
        case 'planned':
            return 'bg-purple-100 text-purple-800 border-purple-100';
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-100';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-100';
    }
};

export default function RoadmapItem({ item }: { item: TRoadmapItem }) {
    return (
        <div key={item.id}>
            <div className='flex flex-col space-y-2'>
                <div className='flex flex-col sm:flex-row items-start justify-between'>
                    <div className='flex items-center gap-2'>
                        <div>
                            <h3 className='text-xl font-semibold leading-none'>{item.title}</h3>
                            <p className='text-sm font-medium mt-1'>{item.description}</p>
                        </div>
                    </div>
                    <div className='flex flex-row sm:flex-col items-end space-x-2 space-y-2 py-2 sm:py-0'>
                        <span className='inline-flex items-center rounded-full border border-purple-300 px-2.5 py-0.5 text-xs text-purple-600 font-semibold'>
                            {item.timeline}
                        </span>
                        <span
                            className={`inline-flex space-x-1.2 items-center rounded-full px-2.5 py-0.5 text-xs border font-semibold ${getStatusColor(item.status)}`}
                        >
                            {item.status === 'in-progress' && (
                                <div className='w-2 h-2 bg-yellow-600 rounded-full animate-pulse mr-1' />
                            )}
                            <span>{item.status === 'in-progress' ? 'In Progress' : 'Planned'}</span>
                        </span>
                    </div>
                </div>
            </div>
            <div className='flex items-center flex-row space-x-1.5 py-1.5'>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getBadgeColor(item.type)}`}
                >
                    {formatBadgeText(item.type)}
                </span>
                {item.isPriority && (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getBadgeColor(item.type)}`}
                    >
                        Priority
                    </span>
                )}
            </div>
        </div>
    );
}
