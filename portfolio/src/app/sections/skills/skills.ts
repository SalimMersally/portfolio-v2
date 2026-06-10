import { Component, input } from '@angular/core';
import { SkillGroup } from '../../core/models/skill.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  imports: [RevealDirective],
})
export class Skills {
  readonly groups = input.required<SkillGroup[]>();
}
