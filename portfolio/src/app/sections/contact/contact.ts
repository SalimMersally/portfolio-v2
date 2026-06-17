import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Profile } from '../../core/models/profile.model';
import { environment } from '../../../environments/environment';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [FormsModule, RevealDirective],
})
export class Contact {
  readonly profile = input.required<Profile>();

  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  readonly status = signal<'idle' | 'sending' | 'success' | 'error'>('idle');

  async sendMessage(): Promise<void> {
    if (!this.name() || !this.email() || !this.message()) return;
    this.status.set('sending');

    const endpoint = environment.contactEndpoint;
    if (!endpoint) {
      const body = `${this.message()}\n\nFrom: ${this.name()}\nEmail: ${this.email()}`;
      window.location.href = `mailto:${this.profile().email}?subject=${encodeURIComponent('Message from ' + this.name())}&body=${encodeURIComponent(body)}`;
      this.status.set('idle');
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: this.name(), email: this.email(), message: this.message() }),
      });
      if (res.ok) {
        this.status.set('success');
        this.name.set('');
        this.email.set('');
        this.message.set('');
      } else {
        this.status.set('error');
      }
    } catch {
      this.status.set('error');
    }
  }
}
