import { Component } from '@angular/core';
import { Books } from '../../sections/books/books';
import { Contact } from '../../sections/contact/contact';
import { EducationSection } from '../../sections/education/education';
import { ExperienceSection } from '../../sections/experience/experience';
import { Introduction } from '../../sections/introduction/introduction';
import { Projects } from '../../sections/projects/projects';
import { Skills } from '../../sections/skills/skills';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [Introduction, ExperienceSection, Skills, EducationSection, Projects, Books, Contact, Footer],
})
export class Home {}
