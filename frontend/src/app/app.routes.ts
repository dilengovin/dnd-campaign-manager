import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  // Default landing — redirect to sign-in.
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Public (pre-auth) routes — rendered standalone, no app shell.
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Authenticated routes — rendered inside the Layout (nav + <router-outlet />).
  // Phase 3: add a CanActivate auth guard on this branch.
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
    ],
  },

  // Anything unknown → back to sign-in.
  { path: '**', redirectTo: 'login' },
];
