export interface Campaign {
    id: string;
    name: string;
    description: string;
    dm: string;
    players: string[];
    notes: string;
}

/** A Campaign as a User records it, before the app gives it an id. */
export type CampaignDraft = Omit<Campaign, 'id'>;
