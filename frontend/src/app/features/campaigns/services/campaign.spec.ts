import { TestBed } from '@angular/core/testing';

import { CampaignService } from './campaign';
import { Campaign } from '../models/campaign';
import { aCampaign } from '../campaign.fixture';

/**
 * Damaged storage has no public cause — nothing the service offers can produce
 * it — so these tests write the raw value themselves. This is the suite's only
 * knowledge of how the service stores anything; every other test sets up state
 * by recording Campaigns through the service and reopening the app.
 */
const STORAGE_KEY = 'dnd.campaigns';
function damageStoredCampaigns(raw: string): void {
  localStorage.setItem(STORAGE_KEY, raw);
}

/**
 * A new browser session over the same storage: the app starts again from
 * scratch and reads whatever the last session left behind.
 */
function reopenTheApp(): CampaignService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(CampaignService);
}

describe('CampaignService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no campaigns when storage is empty', () => {
    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });

  it('starts empty when storage is damaged', () => {
    damageStoredCampaigns('not json');

    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });

  it('starts empty when storage holds something that is not a list', () => {
    damageStoredCampaigns('null');

    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });

  it('makes a recorded campaign retrievable', () => {
    const service = TestBed.inject(CampaignService);

    const recorded = service.create(aCampaign({ name: 'Curse of Strahd' }));

    expect(service.getById(recorded.id)).toEqual(recorded);
    expect(service.campaigns()).toEqual([recorded]);
  });

  it('changes a campaign when it is updated', () => {
    const service = TestBed.inject(CampaignService);
    const recorded = service.create(aCampaign({ notes: 'The party has reached the village.' }));

    const updated = service.update(recorded.id, { notes: 'The party has entered the castle.' });

    expect(updated?.notes).toBe('The party has entered the castle.');
    expect(service.getById(recorded.id)?.notes).toBe('The party has entered the castle.');
  });

  it('leaves the fields an update does not mention alone', () => {
    const service = TestBed.inject(CampaignService);
    const recorded = service.create(aCampaign({ name: 'Curse of Strahd', dm: 'Morgan' }));

    service.update(recorded.id, { notes: 'The party has entered the castle.' });

    expect(service.getById(recorded.id)).toEqual({
      ...recorded,
      notes: 'The party has entered the castle.',
    });
  });

  it('reports rather than crashes when updating a campaign that does not exist', () => {
    const service = TestBed.inject(CampaignService);
    service.create(aCampaign());

    const updated = service.update('no-such-id', { name: 'Nothing' });

    expect(updated).toBeNull();
    expect(service.campaigns()).toHaveLength(1);
  });

  it('removes a campaign, leaving the others', () => {
    const service = TestBed.inject(CampaignService);
    const kept = service.create(aCampaign({ name: 'Curse of Strahd' }));
    const removed = service.create(aCampaign({ name: 'Tomb of Annihilation' }));

    service.delete(removed.id);

    expect(service.getById(removed.id)).toBeUndefined();
    expect(service.campaigns()).toEqual([kept]);
  });

  it('does nothing when removing a campaign that does not exist', () => {
    const service = TestBed.inject(CampaignService);
    const recorded = service.create(aCampaign());

    service.delete('no-such-id');

    expect(service.campaigns()).toEqual([recorded]);
  });

  it('fetches the campaign asked for by id', () => {
    const service = TestBed.inject(CampaignService);
    service.create(aCampaign({ name: 'Curse of Strahd' }));
    const wanted = service.create(aCampaign({ name: 'Tomb of Annihilation' }));
    service.create(aCampaign({ name: 'Out of the Abyss' }));

    expect(service.getById(wanted.id)).toEqual(wanted);
  });

  it('fetches nothing for an id no campaign has', () => {
    const service = TestBed.inject(CampaignService);
    service.create(aCampaign());

    expect(service.getById('no-such-id')).toBeUndefined();
  });

  it('still has the campaigns recorded in an earlier session', () => {
    const first = TestBed.inject(CampaignService);
    const recorded = first.create(aCampaign({ name: 'Curse of Strahd' }));

    const reloaded = reopenTheApp();

    expect(reloaded.campaigns()).toEqual([recorded]);
  });

  it('carries an update and a removal across a reload', () => {
    const first = TestBed.inject(CampaignService);
    const kept = first.create(aCampaign({ name: 'Curse of Strahd' }));
    const removed = first.create(aCampaign({ name: 'Tomb of Annihilation' }));
    first.update(kept.id, { notes: 'The party has entered the castle.' });
    first.delete(removed.id);

    const reloaded = reopenTheApp();

    expect(reloaded.campaigns()).toEqual([
      { ...kept, notes: 'The party has entered the castle.' },
    ]);
  });

  it('can record campaigns again after recovering from damaged storage', () => {
    damageStoredCampaigns('not json');
    const service = TestBed.inject(CampaignService);

    const recorded = service.create(aCampaign({ name: 'Curse of Strahd' }));

    expect(service.campaigns()).toEqual([recorded]);
    expect(reopenTheApp().campaigns()).toEqual([recorded]);
  });
});
