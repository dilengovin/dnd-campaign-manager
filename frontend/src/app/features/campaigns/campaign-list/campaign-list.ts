import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CampaignService } from '../services/campaign';

@Component({
  selector: 'app-campaign-list',
  imports: [RouterLink],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss',
})
export class CampaignList {
  private readonly campaignService = inject(CampaignService);

  readonly campaigns = this.campaignService.campaigns;
}
