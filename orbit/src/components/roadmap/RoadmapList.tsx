import Link from 'next/link';
import RoadmapItem from './RoadmapItem';
import { type RoadmapItem as TRoadmapItem } from './types';

type RoadmapListProps = {
    items: TRoadmapItem[];
};

export default function RoadmapList({ items }: RoadmapListProps) {
    return (
        <div className='flex flex-col min-h-screen z-10'>
            <main className='flex-1'>
                <div className='flex flex-col space-y-8 px-5'>
                    <div className='grid gap-6 md:gap-8'>
                        {/* Should probably memoize this but oh well */}
                        {items
                            .sort((a, b) => {
                                const aPriority = a.isPriority ? 1 : 0;
                                const bPriority = b.isPriority ? 1 : 0;
                                return bPriority - aPriority;
                            })
                            .map((item) => (
                                <RoadmapItem item={item} key={item.id} />
                            ))}
                    </div>
                </div>
                <section className='w-full py-12 md:py-24 lg:py-32 bg-white'>
                    <div className='container mx-auto px-5'>
                        <div className='flex flex-col items-center space-y-4 text-center'>
                            <div className='space-y-2'>
                                <h2 className='text-3xl font-bold sm:text-4xl'>
                                    Got a Feature Request?
                                </h2>
                                <p className='mx-auto max-w-[600px] text-black text-base'>
                                    We&apos;d love to hear from you! Submit your ideas and help
                                    shape the future of Purple.
                                </p>
                            </div>
                            <div className='flex gap-4'>
                                <Link
                                    href='https://purpleapp.featurebase.app/'
                                    target='_blank'
                                    className='bg-gradient-to-b font-semibold from-purple-400 to-purple-600 py-2 px-4 text-sm text-white rounded-full transition duration-500 hover:bg-purple-500'
                                >
                                    Submit Feature Request
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
