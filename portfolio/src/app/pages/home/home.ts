import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PortfolioData, validatePortfolioData } from '../../core/models/portfolio-data.model';
import { SanityService } from '../../core/services/sanity.service';
import { AboutSection } from '../../sections/about/about';
import { Books } from '../../sections/books/books';
import { Contact } from '../../sections/contact/contact';
import { EducationSection } from '../../sections/education/education';
import { ExperienceSection } from '../../sections/experience/experience';
import { Introduction } from '../../sections/introduction/introduction';
import { Projects } from '../../sections/projects/projects';
import { Skills } from '../../sections/skills/skills';
import { Footer } from '../../shared/footer/footer';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    Loading,
    Introduction,
    AboutSection,
    ExperienceSection,
    Projects,
    Skills,
    EducationSection,
    Books,
    Contact,
    Footer,
  ],
})
export class Home implements OnInit {
  private readonly sanity = inject(SanityService);
  private readonly router = inject(Router);

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
      })
      .catch(() => this.router.navigate(['/error']));
  }
}
