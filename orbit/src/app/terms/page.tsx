import { MarkdownContent } from '@/components/blog/BlogPost';
import Hero from '@/components/shared/Hero';
import { getDocument } from '@/utils/utils';

export default async function Terms() {
    const terms = await getDocument('tos.md');

    return (
        <div className='flex items-center flex-col'>
            <Hero
                title={'Terms of Service'}
                description='Welcome to Purple, a personal budgeting and finance app. By using this app, you agree to the following Terms of Service. If you do not agree to these terms, please do not use the app.'
            />
            <article className='prose prose-purple col-span-full md:col-span-4 w-full px-5 text-left prose-p:text-black prose-li:text-black prose-img:rounded-lg mb-20 z-10'>
                <MarkdownContent content={terms.content} />
            </article>
        </div>
    );
}
