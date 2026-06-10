import { Component, computed, inject, input } from '@angular/core';
import { Project } from '../../core/models/project.model';
import { FilterService } from '../../core/services/filter.service';
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
  readonly projects = input.required<Project[]>();
  protected readonly filter = inject(FilterService);
  readonly formatDate = formatDate;

  readonly allTechs = computed(() => {
    const set = new Set<string>();
    this.projects().forEach((p) => p.techStack.forEach((t) => set.add(t)));
    return [...set].sort();
  });

  readonly filteredProjects = computed(() => {
    const skills = this.filter.activeSkills();
    const list = this.projects();
    if (!skills.length) return list;
    return list.filter((p) =>
      skills.some((skill) => p.techStack.some((t) => t.toLowerCase() === skill.toLowerCase())),
    );
  });
}
