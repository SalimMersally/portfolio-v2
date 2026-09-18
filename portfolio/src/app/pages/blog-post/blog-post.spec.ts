import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { PortableTextBlock } from '@portabletext/types';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { BlogDetail } from '../../core/models/blog-detail.model';
import { SanityService } from '../../core/services/sanity.service';
import { BlogPost } from './blog-post';

function heading(key: string, style: 'h1' | 'h2' | 'h3' | 'h4', text: string): PortableTextBlock {
  return {
    _key: key,
    _type: 'block',
    style,
    markDefs: [],
    children: [{ _key: `${key}-span`, _type: 'span', marks: [], text }],
  };
}

function codeBlock(key: string, language: string, code: string): PortableTextBlock {
  return { _key: key, _type: 'code', language, code } as unknown as PortableTextBlock;
}

function postWith(body: PortableTextBlock[]): BlogDetail {
  return {
    _id: 'post-1',
    title: 'Structured article',
    slug: 'structured-article',
    description: 'A test article with a useful outline.',
    tags: ['Testing'],
    publishedAt: '2026-09-17T00:00:00.000Z',
    readTime: 8,
    body,
  };
}

async function renderPost(body: PortableTextBlock[]) {
  const sanity = {
    getBlogBySlug: vi.fn().mockResolvedValue(postWith(body)),
  };

  await TestBed.configureTestingModule({
    imports: [BlogPost],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { params: of({ slug: 'structured-article' }) } },
      { provide: SanityService, useValue: sanity },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(BlogPost);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { element: fixture.nativeElement as HTMLElement, fixture };
}

describe('BlogPost table of contents', () => {
  it('renders h2, h3, and h4 entries as a nested outline while excluding h1', async () => {
    const { element } = await renderPost([
      heading('intro', 'h1', 'Repeated article title'),
      heading('first', 'h2', 'First section'),
      heading('detail-a', 'h3', 'First detail'),
      heading('deep', 'h4', 'Too much detail'),
      heading('second', 'h2', 'Second section'),
      heading('detail-b', 'h3', 'Second detail'),
    ]);

    const toc = element.querySelector('nav[aria-label="Table of contents"]');
    expect(toc?.querySelectorAll('.toc-section')).toHaveLength(2);
    expect(toc?.querySelectorAll('.toc-subitem')).toHaveLength(2);
    expect(toc?.querySelectorAll('.toc-subsubitem')).toHaveLength(1);
    expect(toc?.textContent).not.toContain('Repeated article title');
    expect(toc?.textContent).toContain('Too much detail');
  });

  it('assigns readable unique IDs to duplicate headings and links the outline to them', async () => {
    const { element } = await renderPost([
      heading('first', 'h2', 'API & Auth'),
      heading('detail-a', 'h3', 'How it works'),
      heading('second', 'h2', 'API & Auth'),
      heading('detail-b', 'h3', 'How it works'),
    ]);

    expect(
      Array.from(element.querySelectorAll<HTMLHeadingElement>('.prose h2, .prose h3')).map(
        ({ id }) => id,
      ),
    ).toEqual(['api-auth', 'how-it-works', 'api-auth-2', 'how-it-works-2']);
    expect(
      Array.from(element.querySelectorAll<HTMLAnchorElement>('.post-toc a')).map(
        ({ hash }) => hash,
      ),
    ).toEqual(['#api-auth', '#how-it-works', '#api-auth-2', '#how-it-works-2']);
  });

  it('keeps table-of-contents links on the current blog post route', async () => {
    const { element } = await renderPost([
      heading('first', 'h2', 'First section'),
      heading('detail-a', 'h3', 'First detail'),
      heading('second', 'h2', 'Second section'),
      heading('detail-b', 'h3', 'Second detail'),
    ]);

    const link = element.querySelector<HTMLAnchorElement>('.post-toc a');
    const destination = new URL(link?.href ?? '', document.baseURI);

    expect(destination.pathname).toBe('/blog/structured-article');
    expect(destination.hash).toBe('#first-section');
  });

  it('omits the outline when fewer than four eligible headings exist', async () => {
    const { element } = await renderPost([
      heading('first', 'h2', 'First section'),
      heading('detail', 'h3', 'A detail'),
      heading('second', 'h2', 'Second section'),
    ]);

    expect(element.querySelector('.post-toc')).toBeNull();
  });

  it('toggles the mobile outline with an accessible expanded state', async () => {
    const { element, fixture } = await renderPost([
      heading('first', 'h2', 'First section'),
      heading('detail-a', 'h3', 'First detail'),
      heading('second', 'h2', 'Second section'),
      heading('detail-b', 'h3', 'Second detail'),
    ]);

    const toc = element.querySelector<HTMLElement>('.post-toc');
    const toggle = element.querySelector<HTMLButtonElement>('.toc-toggle');
    toggle?.click();
    fixture.detectChanges();

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toc?.classList.contains('open')).toBe(true);
  });
});

describe('BlogPost code blocks', () => {
  it('highlights YAML while keeping text blocks unhighlighted', async () => {
    const { element } = await renderPost([
      codeBlock('yaml', 'yaml', 'server:\n  enabled: true'),
      codeBlock('text', 'text', 'const answer = 42;'),
    ]);

    const blocks = element.querySelectorAll<HTMLElement>('.code-block');

    expect(blocks[0]?.dataset['lang']).toBe('yaml');
    expect(blocks[0]?.querySelector('.hljs-attr')).not.toBeNull();
    expect(blocks[1]?.dataset['lang']).toBe('text');
    expect(blocks[1]?.querySelector('[class^="hljs-"]')).toBeNull();
  });
});
