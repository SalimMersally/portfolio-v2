import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-dots',
  template: `
    <div class="loading-dots-wrap" [class.full-height]="fullHeight()">
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>
  `,
  styleUrl: './loading-dots.scss',
})
export class LoadingDots {
  readonly fullHeight = input(false);
}
