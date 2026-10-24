import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { CampaignService } from '../services/campaign';

const NAME_REQUIRED = 'A campaign needs a name.';

@Component({
  selector: 'app-campaign-form',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.scss',
})
export class CampaignForm {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);

  // Name only for now — ticket 07 adds the rest of the fields.
  private readonly model = signal({ name: '' });

  readonly campaignForm = form(
    this.model,
    (path) => {
      // `required` for the semantics a screen reader needs; `pattern` because a
      // name of nothing but spaces is as unidentifiable as no name at all.
      required(path.name, { message: NAME_REQUIRED });
      pattern(path.name, /\S/, { message: NAME_REQUIRED });
    },
    {
      submission: {
        action: async () => {
          this.campaignService.create({
            name: this.model().name.trim(),
            description: '',
            dm: '',
            players: [],
            notes: '',
          });
          await this.router.navigate(['/campaigns']);
        },
      },
    },
  );
}
