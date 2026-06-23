import { Component, computed, inject, input } from '@angular/core';
import { Experience } from '../../core/models/experience.model';
import { FilterService } from '../../core/services/filter.service';
import { SkillFilter } from '../../shared/components/skill-filter/skill-filter';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { formatDate, initials, parseDate } from '../../shared/utils/format-date';

interface ExperienceGroup {
  company: string;
  location?: string;
  logoUrl?: string;
  roles: Experience[];
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  imports: [RevealDirective, SkillFilter],
  providers: [FilterService],
})
export class ExperienceSection {
  readonly experiences = input.required<Experience[]>();
  protected readonly filter = inject(FilterService);

  readonly totalExperience = computed(() => {
    const list = this.experiences();
    if (!list.length) return null;
    const oldest = list.reduce(
      (min, exp) => (exp.startDate < min ? exp.startDate : min),
      list[0].startDate,
    );
    const start = parseDate(oldest);
    const now = new Date();
    const totalMonths =
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    return {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12,
      since: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
  });

  readonly allTechs = computed(() => {
    const freq = new Map<string, number>();
    this.experiences().forEach((exp) =>
      exp.technologies.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)),
    );
    return [...freq.entries()]
      .sort(([a, fa], [b, fb]) => fb - fa || a.localeCompare(b))
      .map(([t]) => t);
  });

  readonly groups = computed<ExperienceGroup[]>(() => {
    const map = new Map<string, ExperienceGroup>();
    for (const exp of this.experiences()) {
      if (!map.has(exp.company)) {
        map.set(exp.company, {
          company: exp.company,
          location: exp.location,
          logoUrl: exp.logoUrl,
          roles: [],
        });
      }
      map.get(exp.company)!.roles.push(exp);
    }
    return [...map.values()];
  });

  readonly filteredGroups = computed<ExperienceGroup[]>(() => {
    const skills = this.filter.activeSkills();
    if (!skills.length) return this.groups();
    return this.groups()
      .map((group) => ({
        ...group,
        roles: group.roles.filter((r) =>
          skills.some((skill) =>
            r.technologies?.some((t) => t.toLowerCase() === skill.toLowerCase()),
          ),
        ),
      }))
      .filter((group) => group.roles.length > 0);
  });

  readonly formatDate = formatDate;
  readonly initials = initials;
}
