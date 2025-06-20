export type BlogPost = {
    content: string;
    data: {
        blogImage: string;
        date: string;
        description: string;
        slug: string;
        title: string;
        tags: string[];
        featured: boolean;
    };
    slug: string;
};
