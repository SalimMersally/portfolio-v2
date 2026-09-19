import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BlogDetail } from '../models/blog-detail.model';
import { JsonLd, StaticSeoPage } from '../models/seo.model';

const SITE_URL = 'https://salimalmersally.com';
const AUTHOR = 'Salim Al Mersally';

interface PageSeo {
  title: string;
  description: string;
  path: string;
  image: string;
  imageAlt: string;
}

const STATIC_PAGES: Record<StaticSeoPage, PageSeo> = {
  home: {
    title: 'Built by Salim — Websites, Apps & Reliable Software',
    description:
      'Salim Al Mersally is a senior software engineer building reliable websites, applications, and maintainable software systems.',
    path: '/',
    image: '/og/home.png',
    imageAlt: 'Salim Al Mersally — Senior Software Engineer',
  },
  work: {
    title: 'Work & Experience — Salim Al Mersally',
    description:
      "Explore Salim Al Mersally's software engineering experience, projects, technical skills, education, and reading.",
    path: '/work',
    image: '/og/work.png',
    imageAlt: 'Work and experience by Salim Al Mersally',
  },
  blog: {
    title: 'Software Engineering Blog — Salim Al Mersally',
    description:
      'Articles by Salim Al Mersally about software architecture, backend engineering, Angular, Java, testing, and maintainable systems.',
    path: '/blog',
    image: '/og/blog.png',
    imageAlt: 'Software engineering articles by Salim Al Mersally',
  },
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  setStaticPage(page: StaticSeoPage): void {
    const metadata = STATIC_PAGES[page];
    const canonical = absoluteUrl(metadata.path);
    const image = absoluteUrl(metadata.image);
    let jsonLd: JsonLd;

    if (page === 'home') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: AUTHOR,
        jobTitle: 'Senior Software Engineer',
        url: SITE_URL,
        description: metadata.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tripoli',
          addressRegion: 'North Lebanon',
          addressCountry: 'LB',
        },
        sameAs: [
          'https://github.com/salimalmersally',
          'https://www.linkedin.com/in/salimalmersally',
          'https://www.instagram.com/salimalmersally',
        ],
        knowsAbout: [
          'Software Engineering',
          'Software Architecture',
          'Backend Engineering',
          'Angular',
          'Java',
        ],
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Lebanese American University',
        },
      };
    } else {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': page === 'blog' ? 'CollectionPage' : 'WebPage',
        name: metadata.title,
        description: metadata.description,
        url: canonical,
      };
    }

    this.applyPage({ ...metadata, canonical, image, type: 'website', jsonLd });
  }

  setBlogPost(post: BlogDetail): void {
    const title = `${post.title} — ${AUTHOR}`;
    const description = post.description.trim() || `Read ${post.title} by ${AUTHOR}.`;
    const canonical = absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`);
    const image = blogSocialImageUrl(post);
    const jsonLd: JsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image,
      datePublished: post.publishedAt,
      dateModified: post._updatedAt,
      author: {
        '@type': 'Person',
        name: AUTHOR,
        url: SITE_URL,
      },
      mainEntityOfPage: canonical,
      url: canonical,
      keywords: post.tags,
    };

    this.applyPage({
      title,
      description,
      canonical,
      image,
      imageAlt: post.title,
      type: 'article',
      publishedAt: post.publishedAt,
      modifiedAt: post._updatedAt,
      tags: post.tags,
      jsonLd,
    });
  }

  setNoIndex(title: string, description: string): void {
    this.clearOwnedHead();
    this.title.setTitle(title);
    this.addMeta('name', 'description', description);
    this.addMeta('name', 'robots', 'noindex, nofollow');
  }

  private applyPage(page: {
    title: string;
    description: string;
    canonical: string;
    image: string;
    imageAlt: string;
    type: 'website' | 'article';
    publishedAt?: string;
    modifiedAt?: string;
    tags?: string[];
    jsonLd: JsonLd;
  }): void {
    this.clearOwnedHead();
    this.title.setTitle(page.title);
    this.addMeta('name', 'description', page.description);
    this.addMeta('name', 'robots', 'index, follow');
    this.addMeta('property', 'og:title', page.title);
    this.addMeta('property', 'og:description', page.description);
    this.addMeta('property', 'og:type', page.type);
    this.addMeta('property', 'og:url', page.canonical);
    this.addMeta('property', 'og:image', page.image);
    this.addMeta('property', 'og:image:width', '1200');
    this.addMeta('property', 'og:image:height', '630');
    this.addMeta('property', 'og:image:alt', page.imageAlt);
    this.addMeta('name', 'twitter:card', 'summary_large_image');
    this.addMeta('name', 'twitter:title', page.title);
    this.addMeta('name', 'twitter:description', page.description);
    this.addMeta('name', 'twitter:image', page.image);

    if (page.type === 'article') {
      if (page.publishedAt) {
        this.addMeta('property', 'article:published_time', page.publishedAt);
      }
      if (page.modifiedAt) {
        this.addMeta('property', 'article:modified_time', page.modifiedAt);
      }
      for (const tag of page.tags ?? []) {
        this.addMeta('property', 'article:tag', tag);
      }
    }

    const canonical = this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = page.canonical;
    canonical.setAttribute('data-seo-managed', 'true');
    this.document.head.appendChild(canonical);

    const jsonLd = this.document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.setAttribute('data-seo-json-ld', 'true');
    jsonLd.textContent = JSON.stringify(page.jsonLd).replace(/</g, '\\u003c');
    this.document.head.appendChild(jsonLd);
  }

  private addMeta(attribute: 'name' | 'property', key: string, content: string): void {
    const meta = this.document.createElement('meta');
    meta.setAttribute(attribute, key);
    meta.content = content;
    meta.setAttribute('data-seo-managed', 'true');
    this.document.head.appendChild(meta);
  }

  private clearOwnedHead(): void {
    const selectors = [
      'meta[name="description"]',
      'meta[name="robots"]',
      'meta[name^="twitter:"]',
      'meta[property^="og:"]',
      'meta[property^="article:"]',
      'link[rel="canonical"]',
      'script[data-seo-json-ld]',
    ];

    for (const element of this.document.head.querySelectorAll(selectors.join(', '))) {
      element.remove();
    }
  }
}

export function socialRevision(updatedAt: string): string {
  return updatedAt.replace(/[:.]/g, '-');
}

export function blogSocialImageUrl(post: Pick<BlogDetail, 'slug' | '_updatedAt'>): string {
  return absoluteUrl(
    `/api/og/blog/${encodeURIComponent(post.slug)}/${socialRevision(post._updatedAt)}.png`,
  );
}

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
