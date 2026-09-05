import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project } from '../../core/models/project.model';
import { SelectedWork } from './selected-work';

function project(order: number, title: string): Project {
  return {
    _id: String(order),
    title,
    description: `${title} description`,
    date: '2026-01-01',
    techStack: ['Angular'],
    order,
  };
}

describe('SelectedWork', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        disconnect(): void {}
      },
    );
  });

  it('renders only the first three projects', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedWork],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SelectedWork);
    fixture.componentRef.setInput('projects', [
      project(1, 'One'),
      project(2, 'Two'),
      project(3, 'Three'),
      project(4, 'Four'),
    ]);
    fixture.detectChanges();

    const titles = [...fixture.nativeElement.querySelectorAll('.selected-project h3')].map(
      (element: Element) => element.textContent?.trim(),
    );

    expect(titles).toEqual(['One', 'Two', 'Three']);
  });

  it('omits the section when there are no projects', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedWork],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SelectedWork);
    fixture.componentRef.setInput('projects', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.selected-work')).toBeNull();
  });
});
