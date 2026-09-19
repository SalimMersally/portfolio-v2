import { ViewportScroller } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioData, validatePortfolioData } from '../../core/models/portfolio-data.model';
import { SanityService } from '../../core/services/sanity.service';
import { SeoService } from '../../core/services/seo.service';
import { ServerResponseService } from '../../core/services/server-response.service';
import { ErrorPage } from '../error/error-page';
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
  imports: [LoadingDots, Introduction, Services, Process, AboutSection, Contact, ErrorPage],
})
export class Home implements OnInit {
  private readonly sanity = inject(SanityService);
  private readonly route = inject(ActivatedRoute);
  private readonly scroller = inject(ViewportScroller);
  private readonly seo = inject(SeoService);
  private readonly response = inject(ServerResponseService);

  readonly data = signal<PortfolioData | null>(null);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');

  ngOnInit(): void {
    this.seo.setStaticPage('home');
    this.sanity
      .getAllPortfolioData()
      .then((portfolioData) => {
        if (!validatePortfolioData(portfolioData)) {
          this.showError();
          return;
        }
        this.data.set(portfolioData);
        this.state.set('ready');
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          setTimeout(() => this.scroller.scrollToAnchor(fragment));
        }
      })
      .catch(() => this.showError());
  }

  private showError(): void {
    this.response.setStatus(503);
    this.seo.setNoIndex(
      'Temporarily unavailable — Salim Al Mersally',
      'The site is temporarily unavailable. Please try again shortly.',
    );
    this.state.set('error');
  }
}
