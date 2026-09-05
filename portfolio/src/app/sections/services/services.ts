import { Component, computed, input } from '@angular/core';
import { Service } from '../../core/models/service.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-services',
  imports: [RevealDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  readonly services = input.required<Service[]>();
  /** Home shows the three ordered offers; /work carries the full range. */
  readonly visibleServices = computed(() => this.services().slice(0, 3));
}
