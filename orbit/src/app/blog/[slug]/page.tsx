import BlogPost from '@/components/blog/BlogPost';
import AnimatedClouds from '@/components/shared/AnimatedClouds';
import { getPostBySlug } from '@/utils/utils';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const blog = getPostBySlug(params.slug);

    if (!blog) return notFound();

    return (
        <div className='w-full flex relative bg-gradient-to-b from-purple-400 to-white py-20 overflow-visible'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={500}
                spawnRate={5}
                className='left-0 right-0 absolute z-[2]'
            />
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-[3] relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col text-center w-full'>
                        <div className='w-full'>
                            <BlogPost post={blog} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
