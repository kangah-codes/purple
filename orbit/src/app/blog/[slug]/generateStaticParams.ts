import { getPostSlugs } from '@/utils/utils';

export async function generateStaticParams() {
    const allPosts = await getPostSlugs();
    return allPosts.map((post) => ({ slug: post.slug }));
}
