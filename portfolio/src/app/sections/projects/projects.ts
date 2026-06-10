import { Component, computed, inject, resource } from '@angular/core';
import { FilterService } from '../../core/services/filter.service';
import { SanityService } from '../../core/services/sanity.service';
import { SkillFilter } from '../../shared/components/skill-filter/skill-filter';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { formatDate } from '../../shared/utils/format-date';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  imports: [RevealDirective, SkillFilter],
  providers: [FilterService],
})
export class Projects {
  private readonly sanity = inject(SanityService);
  protected readonly filter = inject(FilterService);
  readonly formatDate = formatDate;

  private readonly data = resource({ loader: () => this.sanity.getProjects() });

  readonly allTechs = computed(() => {
    const set = new Set<string>();
    (this.data.value() ?? []).forEach((p) => p.techStack.forEach((t) => set.add(t)));
    return [...set].sort();
  });

  readonly filteredProjects = computed(() => {
    const skills = this.filter.activeSkills();
    const list = this.data.value() ?? [];
    if (!skills.length) return list;
    return list.filter((p) =>
      skills.some((skill) => p.techStack.some((t) => t.toLowerCase() === skill.toLowerCase())),
    );
  });
}
