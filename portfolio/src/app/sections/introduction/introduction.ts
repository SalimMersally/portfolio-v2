import { Component, input } from '@angular/core';
import { Profile } from '../../core/models/profile.model';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.html',
  styleUrl: './introduction.scss',
})
export class Introduction {
  readonly profile = input.required<Profile>();
}
