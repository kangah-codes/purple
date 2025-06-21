import { MarkdownContent } from '@/components/blog/BlogPost';
import Hero from '@/components/shared/Hero';
import { getDocument } from '@/utils/utils';

export default function Terms() {
    const terms = getDocument('privacy-policy.md');

    return (
        <div className='flex items-center flex-col'>
            <Hero
                title='Privacy Policy'
                description={`Your privacy matters. This Privacy Policy explains how Purple collects, uses,
                  and protects any information you provide while using the app.
                  By using Purple, you agree to the practices outlined here.
                  If you do not agree, please do NOT use the app.
                `}
            />
            <article className='prose prose-purple col-span-full md:col-span-4 w-full px-5 text-left prose-p:text-black prose-li:text-black prose-img:rounded-lg mb-20 z-10'>
                <MarkdownContent content={terms.content} />
            </article>
        </div>
    );
}
