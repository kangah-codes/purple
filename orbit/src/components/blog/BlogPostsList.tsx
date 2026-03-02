'use client';
import { BlogPost as TBlogPost } from '@/types/Blog';
import BlogPostListItem from './BlogPostListItem';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPostsList({ posts }: { posts: TBlogPost[] }) {
    const featuredPost = posts.find((post) => post.data.featured);
    const regularPosts = posts.filter((post) => !post.data.featured);
    const postCount = regularPosts.length;

    return (
        <div className='w-full max-w-2xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto px-5 pb-20 z-[3]'>
            {/* Featured Post (if exists) */}
            {featuredPost && (
                <div className='grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-12 mb-20'>
                    <div className='col-span-12 lg:col-span-7'>
                        <div className='relative w-full h-[250px] md:h-[350px] lg:h-[420px] aspect-[80/31] rounded-[3rem] overflow-hidden shadow-xl shadow-purple-100'>
                            <Link href={`/blog/${featuredPost.slug}`}>
                                <Image
                                    src={`/blog/${featuredPost.data.blogImage}`}
                                    alt={`Cover image for ${featuredPost.data.title}`}
                                    fill
                                    className='object-cover group-hover:scale-105 transition-transform duration-300 z-[2]'
                                    priority={true}
                                    quality={100}
                                />
                            </Link>
                            <div className='bg-gradient-to-br from-purple-400 to-purple-800 w-full h-full filter z-[1] blur-2xl absolute inset-0' />
                        </div>
                    </div>
                    <div className='col-span-12 lg:col-span-5 flex flex-col space-y-4'>
                        <div className='flex items-center gap-x-4 text-xs'>
                            <time
                                dateTime={featuredPost.data.date}
                                className='text-sm text-purple-600'
                            >
                                {featuredPost.data.date}
                            </time>
                            <span className='rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-600 text-xs border border-purple-600'>
                                Featured
                            </span>
                        </div>
                        <h3 className='text-4xl tracking-tight font-bold'>
                            <Link
                                href={`/blog/${featuredPost.slug}`}
                                className='hover:underline hover:text-purple-600 transition-colors'
                            >
                                {featuredPost.data.title}
                            </Link>
                        </h3>
                        <p className='text-base text-black'>{featuredPost.data.description}</p>
                    </div>
                </div>
            )}

            {/* Blog Post Grid */}
            <div
                className={`
                    grid gap-x-10 gap-y-10 border-purple-200
                    ${postCount === 1 ? 'grid-cols-1 max-w-md' : ''}
                    ${postCount === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : ''}
                    ${postCount >= 3 ? 'grid-cols-1 lg:grid-cols-3' : ''}
                `}
            >
                {regularPosts.map((post) => (
                    <div className='flex flex-col max-w-full overflow-hidden' key={post.slug}>
                        <BlogPostListItem key={post.slug} post={post} />
                    </div>
                ))}
            </div>
        </div>
    );
}
