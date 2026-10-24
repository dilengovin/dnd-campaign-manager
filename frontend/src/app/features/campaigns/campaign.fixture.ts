import { CampaignDraft } from './models/campaign';

/**
 * A Campaign as a User would record it, before the app gives it an id.
 *
 * Every field is filled in, so a test that cares about one of them overrides
 * just that one and the rest stay out of the way. Test-only: nothing in the app
 * imports this.
 */
export function aCampaign(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    name: 'Curse of Strahd',
    description: 'Gothic horror in Barovia.',
    dm: 'Morgan',
    players: ['Dylan', 'Eve'],
    notes: 'The party has reached the village.',
    ...overrides,
  };
}
