import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BlogDetail } from '../models/blog-detail.model';
import { SeoService } from './seo.service';

const post: BlogDetail = {
  _id: 'post-1',
  _updatedAt: '2026-09-17T10:20:30.456Z',
  title: 'Structured article',
  slug: 'structured-article',
  description: 'A useful article about reliable systems.',
  tags: ['Testing', 'Architecture'],
  publishedAt: '2026-09-17T00:00:00.000Z',
  body: [],
};

function named(name: string): string | null {
  return document.head.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
}

function property(name: string): string | null {
  return document.head.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ?? null;
}

function canonical(): string | null {
  return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
}

function structuredData(): Record<string, unknown> {
  const text = document.head.querySelector('script[data-seo-json-ld]')?.textContent;
  if (!text) throw new Error('Missing structured data');
  return JSON.parse(text) as Record<string, unknown>;
}

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    document.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[name^="twitter:"], meta[property^="og:"], meta[property^="article:"], link[rel="canonical"], script[data-seo-json-ld]',
      )
      .forEach((element) => element.remove());
    document.title = '';
    TestBed.configureTestingModule({ providers: [SeoService] });
    service = TestBed.inject(SeoService);
  });

  it('sets canonical Work metadata and WebPage structured data', () => {
    service.setStaticPage('work');

    expect(document.title).toBe('Work & Experience — Salim Al Mersally');
    expect(named('description')).toContain('software engineering experience');
    expect(property('og:url')).toBe('https://salimalmersally.com/work');
    expect(property('og:image')).toBe('https://salimalmersally.com/og/work.png');
    expect(canonical()).toBe('https://salimalmersally.com/work');
    expect(structuredData()['@type']).toBe('WebPage');
  });

  it('sets article metadata and BlogPosting structured data', () => {
    service.setBlogPost(post);

    expect(document.title).toBe('Structured article — Salim Al Mersally');
    expect(property('og:type')).toBe('article');
    expect(property('article:published_time')).toBe(post.publishedAt);
    expect(property('article:modified_time')).toBe(post._updatedAt);
    expect(property('og:image')).toBe(
      'https://salimalmersally.com/api/og/blog/structured-article/2026-09-17T10-20-30-456Z.png',
    );
    expect(canonical()).toBe('https://salimalmersally.com/blog/structured-article');
    expect(structuredData()).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Structured article',
      datePublished: post.publishedAt,
      dateModified: post._updatedAt,
    });
  });

  it('replaces article tags instead of accumulating them across posts', () => {
    service.setBlogPost(post);
    service.setBlogPost({ ...post, slug: 'second', title: 'Second', tags: ['Angular'] });

    const tags = Array.from(
      document.head.querySelectorAll('meta[property="article:tag"]'),
      (element) => element.getAttribute('content'),
    );
    expect(tags).toEqual(['Angular']);
  });

  it('uses a deterministic description when a post description is empty', () => {
    service.setBlogPost({ ...post, description: '' });

    expect(named('description')).toBe('Read Structured article by Salim Al Mersally.');
  });

  it('clears article metadata and prevents indexing for error pages', () => {
    service.setBlogPost(post);

    service.setNoIndex(
      'Page not found — Salim Al Mersally',
      'The requested page could not be found.',
    );

    expect(named('robots')).toBe('noindex, nofollow');
    expect(document.head.querySelector('meta[property^="article:"]')).toBeNull();
    expect(document.head.querySelector('script[data-seo-json-ld]')).toBeNull();
  });

  it('emits Person and CollectionPage structured data for Home and Blog', () => {
    service.setStaticPage('home');
    expect(structuredData()['@type']).toBe('Person');

    service.setStaticPage('blog');
    expect(structuredData()['@type']).toBe('CollectionPage');
  });
});
