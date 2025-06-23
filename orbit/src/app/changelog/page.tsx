import { MarkdownContent } from '@/components/blog/BlogPost';
import Hero from '@/components/shared/Hero';
import { getDocument } from '@/utils/utils';

/**
 * ### Added: for new features.
 * ### Changed: for changes in existing functionality.
 * ### Fixed: for any bug fixes.
 * ### Deprecated: for features that will be removed in future versions.
 * ### Removed: for deprecated features that have been removed.
 * ### Security: for any security fixes or upgrades.
 */

export default function Changelog() {
    const changelog = getDocument('changelog.md', 'changelog');

    return (
        <div className='flex items-center flex-col'>
            <Hero title='Changelog' description={``} />
            <article className='prose prose-purple col-span-full md:col-span-4 w-full px-5 text-left prose-p:text-black prose-li:text-black prose-img:rounded-lg mb-20 z-10'>
                <MarkdownContent content={changelog.content} />
            </article>
        </div>
    );
}
