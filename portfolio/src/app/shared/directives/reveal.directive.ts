import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.reveal-delay-1]': "delay() === '1'",
    '[class.reveal-delay-2]': "delay() === '2'",
    '[class.reveal-delay-3]': "delay() === '3'",
    '[class.reveal-delay-4]': "delay() === '4'",
  },
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  readonly delay = input('', { alias: 'appReveal' });

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('in-view');
          this.observer?.unobserve(this.el.nativeElement);
        }
      },
      { threshold: 0.05 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
