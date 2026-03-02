import BlogPostsList from '@/components/blog/BlogPostsList';
import Hero from '@/components/blog/Hero';
import { getPostSlugs } from '@/utils/utils';

export default async function Terms() {
    const allPosts = await getPostSlugs();

    return (
        <div>
            <Hero />
            <BlogPostsList posts={allPosts} />
        </div>
    );
}
