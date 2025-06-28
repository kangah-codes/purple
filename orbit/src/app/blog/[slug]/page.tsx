import BlogPost from '@/components/blog/BlogPost';
import AnimatedClouds from '@/components/shared/AnimatedClouds';
import { getPostBySlug } from '@/utils/utils';
import { notFound } from 'next/navigation';
import { Metadata } from 'next/types';

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getPostBySlug(slug);
    if (!blog) return {};

    console.log('BLOG', blog);
    // http://localhost:3000/_next/image?url=%2Fblog%2Fbuilding-purple%2Fcreating-purple.png&w=1920&q=100

    return {
        title: blog.data.title,
        description: blog.data.description,
        openGraph: {
            title: blog.data.title,
            description: blog.data.description,
            type: 'article',
            url: `https://trypurpleapp.com/blog/${blog.data.slug}`,
            images: [
                {
                    url: `https://trypurpleapp.com/_next/image?url=${encodeURIComponent(blog.data.blogImage)}&w=1920&q=100`,
                    width: 1200,
                    height: 630,
                },
            ],
            tags: blog.data.tags || [],
        },
        twitter: {
            card: 'summary_large_image',
            title: blog.data.title,
            images: [
                `https://trypurpleapp.com/_next/image?url=${encodeURIComponent(blog.data.blogImage)}&w=1920&q=100`,
            ],
        },
    };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const blog = await getPostBySlug(slug);
    if (!blog) return notFound();

    return (
        <div className='w-full flex relative bg-gradient-to-b from-purple-400 to-white py-20 overflow-visible'>
            <AnimatedClouds
                baseSpeed={0.7}
                minHeight={10}
                maxHeight={500}
                spawnRate={5}
                className='left-0 right-0 absolute z-[2]'
            />
            <div className='w-full max-w-2xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-[3] relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 pb-12 space-y-5 flex flex-col text-center w-full'>
                        <BlogPost post={blog} />
                    </div>
                </div>
            </div>
        </div>
    );
}
