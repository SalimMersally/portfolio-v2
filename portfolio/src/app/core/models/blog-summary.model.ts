export interface BlogSeries {
  _id: string;
  title: string;
  slug: string;
}

export interface BlogSummary {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;
  readTime?: number;
  series?: BlogSeries;
  seriesOrder?: number;
}

export function validateBlogSummary(b: unknown): b is BlogSummary {
  if (!b || typeof b !== 'object') return false;
  const blog = b as BlogSummary;
  return (
    typeof blog._id === 'string' &&
    typeof blog._updatedAt === 'string' &&
    typeof blog.title === 'string' &&
    typeof blog.slug === 'string'
  );
}
