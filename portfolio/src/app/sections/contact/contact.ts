import { Component, input } from '@angular/core';
import { Profile } from '../../core/models/profile.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [RevealDirective],
})
export class Contact {
  readonly profile = input.required<Profile>();
}
