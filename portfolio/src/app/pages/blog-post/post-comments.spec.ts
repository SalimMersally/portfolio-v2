import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from '../../core/services/theme.service';
import { giscusTheme, PostComments } from './post-comments';

function render(slug: string, platform: 'browser' | 'server'): ComponentFixture<PostComments> {
  TestBed.configureTestingModule({
    imports: [PostComments],
    providers: [{ provide: PLATFORM_ID, useValue: platform }],
  });
  const fixture = TestBed.createComponent(PostComments);
  fixture.componentRef.setInput('slug', slug);
  fixture.detectChanges();
  return fixture;
}

function attachGiscusFrame(fixture: ComponentFixture<PostComments>): {
  frame: HTMLIFrameElement;
  postMessage: ReturnType<typeof vi.spyOn>;
} {
  const el = fixture.nativeElement as HTMLElement;
  const host = el.querySelector('.giscus-host')!;
  const script = host.querySelector('script')!;
  const frame = document.createElement('iframe');
  frame.className = 'giscus-frame';
  host.appendChild(frame);
  const postMessage = vi.spyOn(frame.contentWindow!, 'postMessage');

  script.dispatchEvent(new Event('load'));

  return { frame, postMessage };
}

describe('PostComments', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders the wrapper but injects no script on the server', () => {
    const fixture = render('sessions-cookies', 'server');
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.giscus-host')).not.toBeNull();
    expect(el.querySelector('script')).toBeNull();
  });

  it('labels the discussion section without rendering a duplicate heading', () => {
    const fixture = render('sessions-cookies', 'server');
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector<HTMLElement>('.post-comments')!;

    expect(section.getAttribute('aria-label')).toBe('Discussion');
    expect(section.querySelector('h2')).toBeNull();
  });

  it('injects the giscus script with the slug as its term', () => {
    const fixture = render('sessions-cookies', 'browser');
    const script = (fixture.nativeElement as HTMLElement).querySelector('script')!;

    expect(script.getAttribute('data-term')).toBe('sessions-cookies');
    expect(script.getAttribute('data-mapping')).toBe('specific');
    expect(script.getAttribute('data-repo')).toBe('SalimMersally/blog-post');
    expect(script.getAttribute('data-repo-id')).toBe('R_kgDOTtkQsg');
    expect(script.getAttribute('data-category-id')).toBe('DIC_kwDOTtkQss4DF9Er');
    expect(script.getAttribute('data-strict')).toBe('1');
    expect(script.getAttribute('data-reactions-enabled')).toBe('1');
    expect(script.getAttribute('data-emit-metadata')).toBe('0');
  });

  it('does not show a GitHub link while comments are available', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.post-comments a')).toBeNull();
  });

  it('keeps one loader and updates the active iframe when the slug changes', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;
    const first = el.querySelector('script');
    const { postMessage } = attachGiscusFrame(fixture);
    postMessage.mockClear();

    fixture.componentRef.setInput('slug', 'the-best-code-is-no-code');
    fixture.detectChanges();

    expect(el.querySelectorAll('script').length).toBe(1);
    expect(el.querySelector('script')).toBe(first);
    expect(postMessage).toHaveBeenCalledWith(
      { giscus: { setConfig: { term: 'the-best-code-is-no-code' } } },
      'https://giscus.app',
    );
  });

  it('sends the latest slug when navigation happens before the iframe is available', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;
    const script = el.querySelector('script');

    fixture.componentRef.setInput('slug', 'the-best-code-is-no-code');
    fixture.detectChanges();
    const { postMessage } = attachGiscusFrame(fixture);

    expect(el.querySelector('script')).toBe(script);
    expect(postMessage).toHaveBeenCalledWith(
      {
        giscus: {
          setConfig: { term: 'the-best-code-is-no-code', theme: 'light' },
        },
      },
      'https://giscus.app',
    );
  });

  it('updates the active iframe theme without replacing the loader', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;
    const script = el.querySelector('script');
    const { postMessage } = attachGiscusFrame(fixture);
    postMessage.mockClear();

    TestBed.inject(ThemeService).mode.set('dark');
    fixture.detectChanges();

    expect(el.querySelector('script')).toBe(script);
    expect(postMessage).toHaveBeenCalledWith(
      { giscus: { setConfig: { theme: 'dark_dimmed' } } },
      'https://giscus.app',
    );
  });

  it('renders a GitHub fallback link when the script fails to load', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector('script')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const link = el.querySelector<HTMLAnchorElement>('.comments-note a')!;
    expect(link.href).toContain('/discussions/categories/comments');
  });

  it('keeps the fallback visible after navigation when the loader has failed', () => {
    const fixture = render('sessions-cookies', 'browser');
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector('script')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    fixture.componentRef.setInput('slug', 'the-best-code-is-no-code');
    fixture.detectChanges();

    expect(el.querySelector('.comments-note a')).not.toBeNull();
  });
});

describe('giscusTheme', () => {
  it('serves the self-hosted theme from whatever https origin is running', () => {
    expect(giscusTheme('light', 'https://salimalmersally.com')).toBe(
      'https://salimalmersally.com/giscus-light.css',
    );
    expect(giscusTheme('dark', 'https://deploy-preview-3--site.netlify.app')).toBe(
      'https://deploy-preview-3--site.netlify.app/giscus-dark.css',
    );
  });

  it('falls back to built-in themes off https, which giscus cannot fetch', () => {
    // A custom theme URL the giscus iframe cannot reach leaves it with no Primer
    // variables at all, which renders as near-invisible text rather than as a
    // wrong colour — so dev must not be handed a localhost URL.
    expect(giscusTheme('light', 'http://localhost:4200')).toBe('light');
    expect(giscusTheme('dark', 'http://localhost:4200')).toBe('dark_dimmed');
  });
});
