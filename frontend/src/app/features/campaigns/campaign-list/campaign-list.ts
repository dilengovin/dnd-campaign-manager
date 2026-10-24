import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Campaign } from '../models/campaign';
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

  /**
   * The one Campaign a User has started removing, if any.
   *
   * Removal is permanent, so it takes two deliberate actions. Holding the id
   * rather than a flag per card keeps the question on the card that was
   * clicked, and keeps it on only one card at a time.
   */
  private readonly removing = signal<string | null>(null);

  isRemoving(campaign: Campaign): boolean {
    return this.removing() === campaign.id;
  }

  askToRemove(campaign: Campaign): void {
    this.removing.set(campaign.id);
  }

  /** Backing out leaves no trace: the list looks as it did before the click. */
  keep(): void {
    this.removing.set(null);
  }

  confirmRemove(campaign: Campaign): void {
    this.campaignService.delete(campaign.id);
    this.removing.set(null);
  }

  /** The size of the table at a glance, worded so a count of one still reads. */
  playerCount(campaign: Campaign): string {
    const count = campaign.players.length;
    return count === 1 ? '1 player' : `${count} players`;
  }
}
