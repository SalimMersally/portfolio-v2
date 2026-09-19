import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

const GISCUS_ORIGIN = 'https://giscus.app';
const GISCUS_SRC = `${GISCUS_ORIGIN}/client.js`;

// Public identifiers from giscus.app — not secrets.
const REPO = 'SalimMersally/blog-post';
const REPO_ID = 'R_kgDOTtkQsg';
const CATEGORY = 'Comments';
const CATEGORY_ID = 'DIC_kwDOTtkQss4DF9Er';

interface GiscusConfig {
  term?: string;
  theme?: string;
}

export const DISCUSSIONS_URL =
  'https://github.com/SalimMersally/blog-post/discussions/categories/comments';

// Self-hosted themes; see portfolio/public/giscus-{light,dark}.css.
//
// Giscus fetches the theme from inside its own iframe, so a custom theme has to
// be an absolute https URL it can reach. http://localhost is not: the iframe is
// https, so the browser blocks it as mixed content, and a failed fetch leaves
// giscus with no Primer variables at all — near-invisible text on a bare page.
// Dev therefore falls back to the closest built-ins.
//
// Deriving the URL from the current origin rather than hardcoding the domain
// also means Netlify deploy previews theme themselves from their own copy.
export function giscusTheme(mode: 'light' | 'dark', origin: string): string {
  if (!origin.startsWith('https://')) return mode === 'dark' ? 'dark_dimmed' : 'light';
  return `${origin}/giscus-${mode}.css`;
}

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.scss',
})
export class PostComments {
  readonly slug = input.required<string>();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly theme = inject(ThemeService);
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('giscusHost');

  readonly failed = signal(false);
  readonly discussionsUrl = DISCUSSIONS_URL;

  private activeTerm: string | null = null;
  private loaderMounted = false;
  private currentFrame: HTMLIFrameElement | null = null;

  constructor() {
    // The router reuses BlogPost across slug changes. Keep one giscus client
    // instance and reconfigure its iframe so the loader's global listeners do
    // not accumulate during a long-lived SPA session.
    effect(() => {
      const term = this.slug();
      if (!this.isBrowser) return;
      untracked(() => this.setTerm(term));
    });

    effect(() => {
      const mode = this.theme.mode();
      if (!this.isBrowser) return;
      untracked(() => this.pushTheme(giscusTheme(mode, location.origin)));
    });
  }

  private setTerm(term: string): void {
    if (this.activeTerm === term) return;
    this.activeTerm = term;

    if (!this.loaderMounted) {
      this.mountLoader(term);
      return;
    }

    this.pushConfig({ term });
  }

  private mountLoader(term: string): void {
    this.loaderMounted = true;
    this.failed.set(false);
    const host = this.host().nativeElement;
    host.replaceChildren();

    const script = document.createElement('script');
    script.src = GISCUS_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', REPO);
    script.setAttribute('data-repo-id', REPO_ID);
    script.setAttribute('data-category', CATEGORY);
    script.setAttribute('data-category-id', CATEGORY_ID);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', term);
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    // 'bottom' puts the compose box after the thread, which is how GitHub
    // itself orders a discussion.
    script.setAttribute('data-input-position', 'bottom');
    // untracked() keeps this read from re-running the mount effect on every
    // theme toggle — that would remount the whole iframe.
    script.setAttribute(
      'data-theme',
      untracked(() => giscusTheme(this.theme.mode(), location.origin)),
    );
    script.setAttribute('data-lang', 'en');
    script.onerror = () => this.failed.set(true);
    script.onload = () => this.connectFrame();

    host.appendChild(script);
  }

  private connectFrame(): void {
    const frame = this.host().nativeElement.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!frame) {
      this.failed.set(true);
      return;
    }

    this.currentFrame = frame;
    const sync = () => {
      if (this.currentFrame !== frame) return;
      this.failed.set(false);
      this.pushConfig({
        term: this.activeTerm ?? undefined,
        theme: giscusTheme(this.theme.mode(), location.origin),
      });
    };

    // Send once now in case the iframe already loaded, and again after each
    // iframe navigation so an early message lost to about:blank is retried.
    frame.addEventListener('load', sync);
    sync();
  }

  private pushTheme(theme: string): void {
    // The iframe does not exist until giscus has loaded, so an early toggle is
    // a no-op; the initial theme rides in on data-theme at injection time.
    this.pushConfig({ theme });
  }

  private pushConfig(config: GiscusConfig): void {
    this.currentFrame?.contentWindow?.postMessage({ giscus: { setConfig: config } }, GISCUS_ORIGIN);
  }
}
