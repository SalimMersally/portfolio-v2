import { Component, inject, resource } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  imports: [RevealDirective],
})
export class Skills {
  private readonly sanity = inject(SanityService);
  readonly groups = resource({ loader: () => this.sanity.getSkills() });
}
