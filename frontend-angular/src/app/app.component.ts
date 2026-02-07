import { Component } from '@angular/core';
import { ToastComponent } from './components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <app-header></app-header>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
  `,
  imports: [ToastComponent]
})
export class AppComponent { }

