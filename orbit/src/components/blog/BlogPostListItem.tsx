import { BlogPost as TBlogPost } from '@/types/Blog';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPostListItem({ post }: { post: TBlogPost }) {
    return (
        <article className='flex max-w-xl flex-col space-y-5 items-start justify-between'>
            <div className='relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden bg-purple-400 shadow-xl shadow-purple-50'>
                <Link href={`/blog/${post.slug}`}>
                    <Image
                        src={`/blog/${post.data.blogImage}`}
                        alt={`Cover image for ${post.data.title}`}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-300'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        priority={false}
                        quality={100}
                    />
                </Link>
            </div>

            <div className='group relative flex flex-col space-y-1 px-2.5'>
                <div className='flex items-center gap-x-4 text-xs'>
                    <time dateTime={post.data.date} className='text-sm text-purple-600'>
                        {post.data.date}
                    </time>
                </div>
                <h3 className='text-2xl tracking-tight font-bold'>
                    <Link
                        href={`/blog/${post.slug}`}
                        className='hover:text-purple-600 transition-colors'
                    >
                        {post.data.title}
                    </Link>
                </h3>
                <p className='text-base text-black line-clamp-3'>{post.data.description}</p>
                <div className='flex flex-wrap gap-2 mt-3'>
                    {post.data.tags?.map((tag) => (
                        <span
                            key={tag}
                            className='rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-600 text-xs border border-purple-600'
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    );
}
