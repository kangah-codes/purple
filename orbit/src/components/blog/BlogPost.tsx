'use client';
import ImageExpand from '@/components/blog/ImageExpand';
import { BlogPost as TBlogPost } from '@/types/Blog';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { useEffect, useState, memo } from 'react';

const AVATAR_ONE = 'https://avatars.githubusercontent.com/u/47978604?v=4';
const AVATAR_TWO = '/graphics/doakes.png';

const Avatar = memo(function Avatar() {
    const [showFirst, setShowFirst] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowFirst((prev) => !prev);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='relative h-10 w-10 flex-shrink-0 bg-white rounded-full overflow-hidden'>
            <Image
                src={AVATAR_ONE}
                alt='Avatar one'
                fill
                className={`object-cover absolute transition-opacity duration-700 ease-in-out ${
                    showFirst ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                priority
                quality={100}
            />
            <Image
                src={AVATAR_TWO}
                alt='Avatar two'
                fill
                className={`object-cover absolute transition-opacity duration-700 ease-in-out ${
                    showFirst ? 'opacity-0 z-0' : 'opacity-100 z-10'
                }`}
                priority
            />
        </div>
    );
});

const BlogHeader = memo(function BlogHeader({
    title,
    date,
    description,
}: {
    title: string;
    date: string;
    description: string;
}) {
    return (
        <div className='w-full overflow-hidden flex flex-col space-y-2 justify-center'>
            <Link
                href='/blog'
                className='bg-purple-300/70 px-5 py-2 flex items-center justify-center rounded-full w-16'
            >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M19 12H5M5 12L12 19M5 12L12 5'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        stroke='#9810fa'
                    />
                </svg>
            </Link>
            <h1 className='flex flex-col text-left text-5xl text-black lg:text-6xl font-bold w-full'>
                {title}
            </h1>
            <span className='text-base text-black text-left'>
                <span className='text-purple-600'>{date}</span>
            </span>
            <p className='text-left text-base text-black'>{description}</p>
        </div>
    );
});

const BannerImage = memo(function BannerImage({ imagePath }: { imagePath: string }) {
    return (
        <div className='w-full h-[15rem] md:h-[20rem] lg:h-[35rem] xl:h-[40rem] relative overflow-hidden rounded-[3rem]'>
            <Image
                src={`/blog/${imagePath}`}
                alt='Banner'
                fill
                className='object-cover z-[2]'
                quality={100}
            />
            <div className='bg-gradient-to-br from-purple-400 to-purple-800 w-full h-full filter z-[1] blur-2xl absolute inset-0' />
        </div>
    );
});

const AuthorInfo = memo(function AuthorInfo() {
    return (
        <div className='flex flex-col overflow-hidden'>
            <p className='text-left text-base text-black whitespace-nowrap overflow-hidden text-ellipsis'>
                Joshua Akangah
            </p>
            <p className='text-left text-sm text-purple-600 whitespace-nowrap overflow-hidden text-ellipsis font-semibold'>
                Resident Bug Squasher
            </p>
        </div>
    );
});

export const MarkdownContent = memo(
    function MarkdownContent({ content }: { content: string }) {
        return (
            <ReactMarkdown
                remarkPlugins={[gfm]}
                components={{
                    // this is to fix the hydration error where <div> cannot be a descendant of <p>
                    p: ({ children }) => (
                        <div className='mb-4 text-black opacity-1'>{children}</div>
                    ),
                    img: ({ src, alt }) => (
                        <div className='my-4'>
                            <ImageExpand src={src!} alt={alt!} />
                        </div>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        );
    },
    (prevProps, nextProps) => prevProps.content === nextProps.content,
);

export default function BlogPost({ post }: { post: TBlogPost }) {
    return (
        <div className='w-full items-center justify-center flex flex-col space-y-10 px-5'>
            {/* header section */}
            <BlogHeader
                title={post.data.title}
                date={post.data.date}
                description={post.data.description}
            />

            {/* banner image */}
            <BannerImage imagePath={post.data.blogImage} />

            {/* content grid */}
            <div className='grid grid-cols-5 w-full gap-4 items-start'>
                {/* author section */}
                <div className='col-span-full md:col-span-1 flex flex-row space-x-2 items-center'>
                    <Avatar />
                    <AuthorInfo />
                </div>

                {/* markdown content */}
                <article className='prose prose-purple col-span-full md:col-span-4 w-full text-left prose-p:text-black prose-li:text-black prose-img:rounded-lg'>
                    <MarkdownContent content={post.content} />
                </article>
            </div>
        </div>
    );
}
