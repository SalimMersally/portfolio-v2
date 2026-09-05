import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND_INSTAGRAM_URL, Profile } from '../../core/models/profile.model';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.html',
  styleUrl: './introduction.scss',
  imports: [RouterLink],
})
export class Introduction {
  readonly profile = input.required<Profile>();
  readonly primaryHref = computed(() => this.profile().instagram || BRAND_INSTAGRAM_URL);
}
