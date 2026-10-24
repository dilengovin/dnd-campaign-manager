import { Component, inject, signal } from '@angular/core';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { CampaignService } from '../services/campaign';

@Component({
  selector: 'app-campaign-form',
  imports: [FormField, RouterLink],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.scss',
})
export class CampaignForm {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);

  // Name only for now — ticket 07 adds the rest of the fields.
  private readonly model = signal({ name: '' });

  readonly campaign = form(this.model, (path) => {
    required(path.name, { message: NAME_REQUIRED });
    // A name of nothing but spaces is as unidentifiable as no name at all.
    pattern(path.name, /\S/, { message: NAME_REQUIRED });
  });

  readonly nameRequiredMessage = NAME_REQUIRED;

  async record(): Promise<void> {
    await submit(this.campaign, {
      action: async () => {
        this.campaignService.create({
          name: this.model().name.trim(),
          description: '',
          dm: '',
          players: [],
          notes: '',
        });
        await this.router.navigate(['/campaigns']);
        return undefined;
      },
    });
  }
}

const NAME_REQUIRED = 'A campaign needs a name.';
