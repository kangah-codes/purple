import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/types/Blog';

const mdFiles = path.join(process.cwd(), 'src/blog');
export function getPostSlugs(): BlogPost[] {
    const allPosts = fs.readdirSync(mdFiles);
    return allPosts.map((fileName) => {
        const slug = fileName.replace('.md', '');
        const fileContent = fs.readFileSync(path.join(mdFiles, fileName), 'utf-8');
        const { data, content } = matter(fileContent);

        return {
            data,
            content,
            slug,
        } as unknown as BlogPost;
    });
}

export function getPostBySlug(slug: string): BlogPost | null {
    const filePath = path.join(mdFiles, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
        data,
        content,
        slug,
    } as BlogPost;
}

export function getDocument(fileName: string) {
    const filePath = path.join(process.cwd(), 'src/legal', fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Document ${fileName} not found in /legal`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
        data,
        content,
        slug: fileName.replace('.md', ''),
    };
}

export function parseDateWithOrdinal(dateString: string) {
    const parts = dateString.split(' ');
    const day = parseInt(parts[0]);
    const month = parts[1].replaceAll(',', '');
    const year = parseInt(parts[2]);

    // Remove ordinal indicator from day (e.g., "17th" becomes "17")
    const dayWithoutOrdinal = day.toString().replace(/\D/g, '');

    // Map month names to month indices (January is 0, February is 1, etc.)
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const monthIndex = monthNames.findIndex((monthName) => monthName === month);

    if (monthIndex === -1) {
        throw new Error('Invalid month name');
    }

    return new Date(year, monthIndex, Number(dayWithoutOrdinal));
}
