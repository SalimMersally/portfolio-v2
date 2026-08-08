import { ViewportScroller } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioData, validatePortfolioData } from '../../core/models/portfolio-data.model';
import { SanityService } from '../../core/services/sanity.service';
import { Books } from '../../sections/books/books';
import { EducationSection } from '../../sections/education/education';
import { ExperienceSection } from '../../sections/experience/experience';
import { Projects } from '../../sections/projects/projects';
import { Skills } from '../../sections/skills/skills';
import { LoadingDots } from '../../shared/components/loading-dots/loading-dots';

@Component({
  selector: 'app-work',
  templateUrl: './work.html',
  styleUrl: './work.scss',
  imports: [LoadingDots, ExperienceSection, Projects, Skills, EducationSection, Books],
})
export class Work implements OnInit {
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
