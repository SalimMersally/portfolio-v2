import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [],
})
export class Footer {
  readonly year = new Date().getFullYear();
}
