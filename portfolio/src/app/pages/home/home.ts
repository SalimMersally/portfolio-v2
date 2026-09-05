import { ViewportScroller } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioData, validatePortfolioData } from '../../core/models/portfolio-data.model';
import { SanityService } from '../../core/services/sanity.service';
import { AboutSection } from '../../sections/about/about';
import { Contact } from '../../sections/contact/contact';
import { Introduction } from '../../sections/introduction/introduction';
import { Process } from '../../sections/process/process';
import { Services } from '../../sections/services/services';
import { LoadingDots } from '../../shared/components/loading-dots/loading-dots';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [LoadingDots, Introduction, Services, Process, AboutSection, Contact],
})
export class Home implements OnInit {
  private readonly sanity = inject(SanityService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly scroller = inject(ViewportScroller);

  readonly data = signal<PortfolioData | null>(null);

  ngOnInit(): void {
    this.sanity
      .getAllPortfolioData()
      .then((portfolioData) => {
        if (!validatePortfolioData(portfolioData)) {
          this.router.navigate(['/error']);
          return;
        }
        this.data.set(portfolioData);
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          setTimeout(() => this.scroller.scrollToAnchor(fragment));
        }
      })
      .catch(() => this.router.navigate(['/error']));
  }
}
