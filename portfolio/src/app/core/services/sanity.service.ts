import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../../environments/environment';
import { PortfolioData } from '../models/portfolio-data.model';
import { BlogSummary } from '../models/blog-summary.model';
import { BlogDetail, BlogNavItem } from '../models/blog-detail.model';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly client: SanityClient = createClient({
    projectId: environment.sanityProjectId,
    dataset: environment.sanityDataset,
    apiVersion: environment.sanityApiVersion,
    useCdn: true,
  });

  getAllPortfolioData(): Promise<PortfolioData> {
    return this.client.fetch<PortfolioData>(`{
      "profile": *[_type == "profile"][0] {
        name, title, tagline,
        "cvUrl": cv.asset->url,
        email, phone, location, github, linkedin, contactIntro
      },
      "about": *[_type == "about"][0] {
        "photoUrl": photo.asset->url,
        bio,
        highlights[] { value, label }
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
    return this.client.fetch(`{
      "blogs": *[_type == "post"] | order(publishedAt desc) {
        _id, title, "slug": slug.current,
        description, tags, publishedAt, readTime,
        "series": series-> { _id, title, "slug": slug.current },
        seriesOrder
      }
    }`);
  }

  async getBlogBySlug(slug: string): Promise<BlogDetail | null> {
    const blog = await this.client.fetch<BlogDetail | null>(
      `*[_type == "post" && slug.current == $slug][0] {
        _id, title, "slug": slug.current,
        description, tags, publishedAt, readTime, mediumLink,
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

    const nav = await this.client.fetch<{
      prevPost: BlogNavItem | null;
      nextPost: BlogNavItem | null;
      seriesTotal: number;
    }>(
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
}
