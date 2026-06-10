import { Injectable, signal } from '@angular/core';

@Injectable()
export class FilterService {
  readonly activeSkills = signal<string[]>([]);

  toggle(skill: string): void {
    this.activeSkills.update((current) =>
      current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill],
    );
  }

  clear(): void {
    this.activeSkills.set([]);
  }

  has(skill: string): boolean {
    return this.activeSkills().includes(skill);
  }
}
