import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingDots } from '../../shared/components/loading-dots/loading-dots';
import { BlogDetail } from '../../core/models/blog-detail.model';
import { SanityService } from '../../core/services/sanity.service';
import { formatDateFull } from '../../shared/utils/format-date';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import yaml from 'highlight.js/lib/languages/yaml';
import plaintext from 'highlight.js/lib/languages/plaintext';
import { toHTML } from '@portabletext/to-html';
import { PostToc, TocSection } from './post-toc';
import { PostComments } from './post-comments';
import { SeoService } from '../../core/services/seo.service';
import { ServerResponseService } from '../../core/services/server-response.service';
import { ErrorPage } from '../error/error-page';
import { NotFound } from '../not-found/not-found';

interface RenderedBody {
  html: string;
  toc: TocSection[];
  tocEntryCount: number;
}

interface HeadingBlock {
  _type?: string;
  _key?: string;
  style?: string;
  children?: Array<{ text?: string }>;
}

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('go', go);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext);
hljs.registerLanguage('txt', plaintext);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Module-level: convert Portable Text body to HTML and derive its navigation outline.
function renderBody(body: unknown[]): RenderedBody {
  const toc: TocSection[] = [];
  const headingIds = new Map<string, string>();
  const slugCounts = new Map<string, number>();
  let currentH2: TocSection | null = null;
  let currentH3: TocSection | null = null;

  body.forEach((value, index) => {
    const block = value as HeadingBlock;
    if (
      block._type !== 'block' ||
      (block.style !== 'h2' && block.style !== 'h3' && block.style !== 'h4')
    )
      return;

    const text =
      block.children
        ?.map((child) => child.text ?? '')
        .join('')
        ?.trim() ?? '';
    if (!text) return;

    const baseId = slugifyHeading(text);
    const count = (slugCounts.get(baseId) ?? 0) + 1;
    slugCounts.set(baseId, count);
    const id = count === 1 ? baseId : `${baseId}-${count}`;
    headingIds.set(block._key ?? String(index), id);

    const item: TocSection = { id, text, children: [] };
    if (block.style === 'h2') {
      toc.push(item);
      currentH2 = item;
      currentH3 = null;
    } else if (block.style === 'h3' && currentH2) {
      currentH2.children.push(item);
      currentH3 = item;
    } else if (block.style === 'h4' && currentH3) {
      currentH3.children.push(item);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html = toHTML(body as any, {
    components: {
      block: {
        h2: ({ value, index, children }) => {
          const id = headingIds.get(value._key ?? String(index));
          return `<h2${id ? ` id="${id}"` : ''}>${children}</h2>`;
        },
        h3: ({ value, index, children }) => {
          const id = headingIds.get(value._key ?? String(index));
          return `<h3${id ? ` id="${id}"` : ''}>${children}</h3>`;
        },
        h4: ({ value, index, children }) => {
          const id = headingIds.get(value._key ?? String(index));
          return `<h4${id ? ` id="${id}"` : ''}>${children}</h4>`;
        },
      },
      marks: {
        link: ({ value, children }: { value?: { href?: string }; children: string }) => {
          const href = esc(value?.href ?? '');
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`;
        },
      },
      types: {
        code: ({ value }: { value: { language?: string; code?: string } }) => {
          const lang = esc(value.language ?? 'plaintext');
          const code = value.code ?? '';
          const highlighted = hljs.getLanguage(lang)
            ? hljs.highlight(code, { language: lang }).value
            : hljs.highlightAuto(code).value;
          const lines = highlighted.split('\n');
          if (lines.at(-1) === '') lines.pop();
          const body = lines.map((l) => `<span class="line">${l}</span>`).join('');
          return `<div class="code-block" data-lang="${lang}"><div class="code-block-header"><span class="code-lang">${lang}</span></div><pre><code>${body}</code></pre></div>`;
        },
        image: ({ value }: { value: { assetUrl?: string; alt?: string; caption?: string } }) => {
          if (!value.assetUrl) return '';
          const alt = esc(value.alt ?? '');
          const caption = value.caption ? `<figcaption>${esc(value.caption)}</figcaption>` : '';
          const src = `${esc(value.assetUrl)}?w=1480&fit=max&auto=format`;
          return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${caption}</figure>`;
        },
      },
    },
  });

  return {
    html,
    toc,
    tocEntryCount: countTocEntries(toc),
  };
}

function countTocEntries(items: TocSection[]): number {
  return items.reduce((count, item) => count + 1 + countTocEntries(item.children), 0);
}

function slugifyHeading(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.html',
  styleUrl: './blog-post.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, LoadingDots, PostToc, ErrorPage, NotFound, PostComments],
})
export class BlogPost implements OnInit {
  private readonly sanity = inject(SanityService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seo = inject(SeoService);
  private readonly response = inject(ServerResponseService);

  readonly blog = signal<BlogDetail | null>(null);
  readonly state = signal<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  readonly loading = computed(() => this.state() === 'loading');
  readonly wideMode = signal(false);

  /** `owner/repo[/tree/branch/path]` label derived from the post's GitHub URL. */
  readonly repo = computed(() => {
    const url = this.blog()?.githubRepo;
    if (!url) return null;
    const label = url
      .replace(/^https?:\/\/(www\.)?github\.com\//, '')
      .replace(/\.git$/, '')
      .replace(/\/$/, '');
    return { url, label };
  });

  private readonly renderedBody = computed((): RenderedBody | null => {
    const b = this.blog();
    if (!b?.body) return null;
    return renderBody(b.body);
  });

  readonly htmlBody = computed((): SafeHtml | null => {
    const rendered = this.renderedBody();
    return rendered ? this.sanitizer.bypassSecurityTrustHtml(rendered.html) : null;
  });

  readonly tocSections = computed(() => this.renderedBody()?.toc ?? []);
  readonly tocEntryCount = computed(() => this.renderedBody()?.tocEntryCount ?? 0);
  readonly showToc = computed(() => this.tocEntryCount() >= 4);

  private readonly _copyBtnEffect = effect(() => {
    const html = this.htmlBody();
    if (!html) return;
    afterNextRender(() => this.attachCopyButtons(), { injector: this.injector });
  });

  constructor() {
    // Restore width preference before first paint.
    afterNextRender(() => {
      if (localStorage.getItem('blog-width') === 'wide') this.wideMode.set(true);
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params['slug'] as string;
      this.state.set('loading');
      this.blog.set(null);
      this.sanity
        .getBlogBySlug(slug)
        .then((blog) => {
          if (!blog) {
            this.showNotFound();
            return;
          }
          this.seo.setBlogPost(blog);
          this.blog.set(blog);
          this.state.set('ready');
          this.scrollToInitialFragment();
        })
        .catch(() => this.showError());
    });
  }

  private showNotFound(): void {
    this.response.setStatus(404);
    this.seo.setNoIndex(
      'Page not found — Salim Al Mersally',
      'The requested page could not be found.',
    );
    this.state.set('not-found');
  }

  private showError(): void {
    this.response.setStatus(503);
    this.seo.setNoIndex(
      'Temporarily unavailable — Salim Al Mersally',
      'The site is temporarily unavailable. Please try again shortly.',
    );
    this.state.set('error');
  }

  setWide(wide: boolean): void {
    this.wideMode.set(wide);
    localStorage.setItem('blog-width', wide ? 'wide' : 'narrow');
  }

  formatDate(iso: string): string {
    return formatDateFull(iso);
  }

  private scrollToInitialFragment(): void {
    const fragment = this.route.snapshot?.fragment;
    if (!fragment) return;
    afterNextRender(() => this.viewportScroller.scrollToAnchor(fragment), {
      injector: this.injector,
    });
  }

  private attachCopyButtons(): void {
    const blocks = this.elRef.nativeElement.querySelectorAll(
      '.prose .code-block',
    ) as NodeListOf<HTMLElement>;
    blocks.forEach((block: HTMLElement) => {
      const header = block.querySelector('.code-block-header') as HTMLElement | null;
      if (!header || header.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = copyIcon();
      btn.addEventListener('click', () => {
        const text = block.querySelector('code')?.innerText ?? '';
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = checkIcon();
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = copyIcon();
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      header.appendChild(btn);
    });
  }
}

function copyIcon(): string {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

function checkIcon(): string {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}
