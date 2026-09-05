import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../core/models/project.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-selected-work',
  imports: [RouterLink, RevealDirective],
  templateUrl: './selected-work.html',
  styleUrl: './selected-work.scss',
})
export class SelectedWork {
  readonly projects = input.required<Project[]>();
  readonly visibleProjects = computed(() => this.projects().slice(0, 3));
}
