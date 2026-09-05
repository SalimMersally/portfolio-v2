import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-process',
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class Process {
  readonly steps = [
    {
      title: 'Understand',
      text: 'Clarify the goal, audience, constraints, and useful outcome.',
    },
    {
      title: 'Shape',
      text: 'Agree on scope, priorities, timeline, and the simplest suitable solution.',
    },
    {
      title: 'Build',
      text: 'Deliver in visible increments with clear communication.',
    },
    {
      title: 'Support',
      text: 'Launch carefully, document the result, and handle agreed follow-up.',
    },
  ] as const;
}
