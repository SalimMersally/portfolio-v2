import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';

@Directive({ selector: '[appReveal]', standalone: true, host: { class: 'reveal' } })
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input('appReveal') delay: string = '';

  @HostBinding('class.reveal-delay-1') get d1() {
    return this.delay === '1';
  }
  @HostBinding('class.reveal-delay-2') get d2() {
    return this.delay === '2';
  }
  @HostBinding('class.reveal-delay-3') get d3() {
    return this.delay === '3';
  }
  @HostBinding('class.reveal-delay-4') get d4() {
    return this.delay === '4';
  }

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
