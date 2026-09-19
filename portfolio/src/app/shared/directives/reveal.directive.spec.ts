import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealDirective } from './reveal.directive';

@Component({ imports: [RevealDirective], template: '<div appReveal></div>' })
class Host {}

describe('RevealDirective', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not construct IntersectionObserver on the server', () => {
    const observer = vi.fn();
    vi.stubGlobal('IntersectionObserver', observer);
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(observer).not.toHaveBeenCalled();
  });
});
