import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  // No stylesheet: the shell is a bare <router-outlet />.
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
