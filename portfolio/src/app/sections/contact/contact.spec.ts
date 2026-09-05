import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Profile } from '../../core/models/profile.model';
import { buildMailtoHref, Contact } from './contact';

const profile: Profile = {
  name: 'Salim Al Mersally',
  title: 'Software Engineer',
  tagline: 'Reliable software',
  email: 'salim@example.com',
  location: 'Lebanon',
  github: 'https://github.com/SalimMersally',
  linkedin: 'https://linkedin.com/in/salim-al-mersally',
  cvUrl: '/cv.pdf',
  contactIntro: 'Tell me about your project.',
};

describe('buildMailtoHref', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        disconnect(): void {}
      },
    );
  });

  it('encodes the project inquiry for an email application', () => {
    expect(
      buildMailtoHref('salim@example.com', 'Ada Lovelace', 'ada@example.com', 'Website & app'),
    ).toBe(
      'mailto:salim@example.com?subject=Project%20inquiry%20from%20Ada%20Lovelace&body=Website%20%26%20app%0A%0AFrom%3A%20Ada%20Lovelace%0AEmail%3A%20ada%40example.com',
    );
  });

  it('keeps Instagram as the primary contact when the CMS field is empty', async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.componentRef.setInput('profile', profile);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const primary = element.querySelector<HTMLAnchorElement>('.contact-primary');
    expect(primary?.textContent).toContain('Message me on Instagram');
    expect(primary?.href).toBe('https://www.instagram.com/built.by.salim/');
  });
});
