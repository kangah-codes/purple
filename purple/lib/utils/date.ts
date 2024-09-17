export function formatDate(
    date: string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
    return new Date(date).toLocaleDateString(undefined, options);
}
