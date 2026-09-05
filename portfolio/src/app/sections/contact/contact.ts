import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BRAND_INSTAGRAM_URL, Profile } from '../../core/models/profile.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

export function buildMailtoHref(
  recipient: string,
  name: string,
  email: string,
  message: string,
): string {
  const subject = encodeURIComponent(`Project inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [FormsModule, RevealDirective],
})
export class Contact {
  readonly profile = input.required<Profile>();
  readonly instagramHref = computed(() => this.profile().instagram || BRAND_INSTAGRAM_URL);

  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  sendMessage(): void {
    if (!this.name() || !this.email() || !this.message()) return;
    window.location.href = buildMailtoHref(
      this.profile().email,
      this.name(),
      this.email(),
      this.message(),
    );
  }
}
