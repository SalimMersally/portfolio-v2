import { PortableTextBlock } from '@portabletext/types';
import { BlogSeries } from './blog-summary.model';

export interface BlogNavItem {
  title: string;
  slug: string;
  seriesOrder: number;
}

export interface BlogDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;
  readTime?: number;
  body: PortableTextBlock[];
  series?: BlogSeries;
  seriesOrder?: number;
  seriesTotal?: number;
  prevPost?: BlogNavItem;
  nextPost?: BlogNavItem;
  mediumLink?: string;
}
