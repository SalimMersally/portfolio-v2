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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { toHTML } from '@portabletext/to-html';

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

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Module-level: convert Portable Text body to an HTML string.
function renderBody(body: unknown[]): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toHTML(body as any, {
    components: {
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
          return `<figure><img src="${value.assetUrl}" alt="${alt}" loading="lazy" />${caption}</figure>`;
        },
      },
    },
  });
}

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.html',
  styleUrl: './blog-post.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, LoadingDots],
})
export class BlogPost implements OnInit {
  private readonly sanity = inject(SanityService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly blog = signal<BlogDetail | null>(null);
  readonly loading = signal(true);
  readonly wideMode = signal(false);

  readonly htmlBody = computed((): SafeHtml | null => {
    const b = this.blog();
    if (!b?.body) return null;
    return this.sanitizer.bypassSecurityTrustHtml(renderBody(b.body));
  });

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
      this.loading.set(true);
      this.blog.set(null);
      this.sanity
        .getBlogBySlug(slug)
        .then((blog) => {
          if (!blog) {
            this.router.navigate(['/not-found']);
            return;
          }
          this.blog.set(blog);
          this.loading.set(false);
        })
        .catch(() => this.router.navigate(['/not-found']));
    });
  }

  setWide(wide: boolean): void {
    this.wideMode.set(wide);
    localStorage.setItem('blog-width', wide ? 'wide' : 'narrow');
  }

  formatDate(iso: string): string {
    return formatDateFull(iso);
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
