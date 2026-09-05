import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Profile } from '../../core/models/profile.model';
import { Introduction } from './introduction';

const profile: Profile = {
  name: 'Salim Al Mersally',
  title: 'Software Engineer',
  tagline: 'Reliable software',
  email: 'salim@example.com',
  location: 'Lebanon',
  github: 'https://github.com/SalimMersally',
  linkedin: 'https://linkedin.com/in/salim-al-mersally',
  instagram: 'https://www.instagram.com/built.by.salim/',
  cvUrl: '/cv.pdf',
  contactIntro: 'Tell me about your project.',
};

describe('Introduction', () => {
  it('presents the client promise and Instagram as the primary action', async () => {
    await TestBed.configureTestingModule({
      imports: [Introduction],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Introduction);
    fixture.componentRef.setInput('profile', profile);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const primary = element.querySelector<HTMLAnchorElement>('.button-action');

    expect(element.querySelector('h1')?.textContent).toContain('I build useful software');
    expect(primary?.textContent?.trim()).toBe('Start a project');
    expect(primary?.href).toBe(profile.instagram);
    // The portrait lives in the About section only; the hero must not repeat it.
    expect(element.querySelector('.hero img[src*="portrait"]')).toBeNull();
  });

  it('uses the built.by.salim Instagram account when Sanity has no override', async () => {
    await TestBed.configureTestingModule({
      imports: [Introduction],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Introduction);
    fixture.componentRef.setInput('profile', { ...profile, instagram: undefined });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const primary = element.querySelector<HTMLAnchorElement>('.button-action');
    expect(primary?.href).toBe('https://www.instagram.com/built.by.salim/');
  });
});
