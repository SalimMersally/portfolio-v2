import {
  inject,
  Injectable,
  makeStateKey,
  PendingTasks,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { QueryParams, SanityClient } from '@sanity/client';
import { PortfolioData } from '../models/portfolio-data.model';
import { BlogSummary } from '../models/blog-summary.model';
import { BlogDetail, BlogNavItem } from '../models/blog-detail.model';
import { SANITY_CLIENT } from './sanity-client.token';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly client: SanityClient = inject(SANITY_CLIENT);
  private readonly transferState = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly platformId = inject(PLATFORM_ID);

  getAllPortfolioData(): Promise<PortfolioData> {
    return this.fetchTransferred<PortfolioData>('sanity:portfolio', `{
      "profile": *[_type == "profile"][0] {
        name, title, tagline,
        "cvUrl": cv.asset->url,
        email, phone, location, github, linkedin, instagram, contactIntro
      },
      "about": *[_type == "about"][0] {
        "photoUrl": photo.asset->url,
        bio,
        highlights[] { value, label }
      },
      "services": *[_type == "service"] | order(order asc) {
        _id, title, description, order
      },
      "experiences": *[_type == "experience"] | order(startDate desc) {
        _id, company, role, location,
        "logoUrl": logo.asset->url,
        startDate, endDate, current,
        bullets, technologies
      },
      "projects": *[_type == "project"] | order(order asc) {
        _id, title, description, date, techStack, githubUrl, liveUrl, order
      },
      "skills": *[_type == "skill"] | order(order asc) {
        _id, category, items, order
      },
      "education": *[_type == "education"] | order(order asc) {
        _id, type, degree, field, institution, location,
        "logoUrl": logo.asset->url,
        "credentialUrl": credential.asset->url,
        gpa, startDate, endDate, highlights, technologies, order
      },
      "books": *[_type == "book"] {
        _id, title, author,
        "coverUrl": cover.asset->url,
        status
      }
    }`);
  }

  getBlogs(): Promise<{ blogs: BlogSummary[] }> {
    return this.fetchTransferred('sanity:blogs', `{
      "blogs": *[_type == "post"] | order(publishedAt desc) {
        _id, _updatedAt, title, "slug": slug.current,
        description, tags, publishedAt, readTime,
        "series": series-> { _id, title, "slug": slug.current },
        seriesOrder
      }
    }`);
  }

  async getBlogBySlug(slug: string): Promise<BlogDetail | null> {
    const blog = await this.fetchTransferred<BlogDetail | null>(
      `sanity:blog:${slug}`,
      `*[_type == "post" && slug.current == $slug][0] {
        _id, _updatedAt, title, "slug": slug.current,
        description, tags, publishedAt, readTime, mediumLink, githubRepo,
        "body": body[]{
          ...,
          _type == "image" => { "assetUrl": asset->url }
        },
        "series": series-> { _id, title, "slug": slug.current },
        seriesOrder
      }`,
      { slug },
    );

    if (!blog || !blog.series) return blog;

    const nav = await this.fetchTransferred<{
      prevPost: BlogNavItem | null;
      nextPost: BlogNavItem | null;
      seriesTotal: number;
    }>(
      `sanity:blog-nav:${blog.series._id}:${blog.seriesOrder ?? 0}`,
      `{
        "prevPost": *[_type == "post" && references($seriesId) && seriesOrder == $order - 1][0] {
          title, "slug": slug.current, seriesOrder
        },
        "nextPost": *[_type == "post" && references($seriesId) && seriesOrder == $order + 1][0] {
          title, "slug": slug.current, seriesOrder
        },
        "seriesTotal": count(*[_type == "post" && references($seriesId)])
      }`,
      { seriesId: blog.series._id, order: blog.seriesOrder ?? 0 },
    );

    return {
      ...blog,
      prevPost: nav.prevPost ?? undefined,
      nextPost: nav.nextPost ?? undefined,
      seriesTotal: nav.seriesTotal,
    };
  }

  private fetchTransferred<T>(
    keyName: string,
    query: string,
    params: QueryParams = {},
  ): Promise<T> {
    const key = makeStateKey<T>(keyName);
    if (this.transferState.hasKey(key)) {
      const value = this.transferState.get(key, undefined as T);
      this.transferState.remove(key);
      return Promise.resolve(value);
    }

    const complete = this.pendingTasks.add();
    return this.client
      .fetch<T>(query, params)
      .then((value) => {
        if (isPlatformServer(this.platformId)) this.transferState.set(key, value);
        return value;
      })
      .finally(complete);
  }
}
