import { MarkdownContent } from '@/components/blog/BlogPost';
import Hero from '@/components/terms/Hero';
import { getDocument } from '@/utils/utils';

export default function License() {
    const licence = getDocument('license.md');

    return (
        <div className='flex items-center flex-col'>
            <Hero title='Licence For Purple' description={``} />
            <article className='prose prose-purple col-span-full md:col-span-4 w-full px-0 sm:px-4 text-left prose-p:text-black prose-li:text-black prose-img:rounded-lg mb-20'>
                <MarkdownContent content={licence.content} />
            </article>
        </div>
    );
}
