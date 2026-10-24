import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { CampaignForm } from './features/campaigns/campaign-form/campaign-form';
import { CampaignList } from './features/campaigns/campaign-list/campaign-list';
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
      // The Campaign list is the app's home.
      { path: 'campaigns', component: CampaignList },
      { path: 'campaigns/new', component: CampaignForm },

      // The Dashboard was deleted in Phase 2; keep its links resolving.
      { path: 'dashboard', pathMatch: 'full', redirectTo: 'campaigns' },
    ],
  },

  // Anything unknown → back to sign-in.
  { path: '**', redirectTo: 'login' },
];
