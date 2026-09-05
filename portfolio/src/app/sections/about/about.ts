import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { About } from '../../core/models/about.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
  imports: [RevealDirective, RouterLink],
})
export class AboutSection {
  readonly about = input.required<About>();
}
