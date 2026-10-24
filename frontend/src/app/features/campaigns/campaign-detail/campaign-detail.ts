import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CampaignService } from '../services/campaign';

@Component({
  selector: 'app-campaign-detail',
  imports: [RouterLink],
  templateUrl: './campaign-detail.html',
  styleUrl: './campaign-detail.scss',
})
export class CampaignDetail {
  private readonly campaignService = inject(CampaignService);

  /** Bound from the route's `:id` segment. */
  readonly id = input.required<string>();

  // Through `campaigns()` rather than `getById`, so the page follows the
  // Campaign as it changes — an edit is visible the moment it is saved.
  readonly campaign = computed(() =>
    this.campaignService.campaigns().find((c) => c.id === this.id()),
  );
}
