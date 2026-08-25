import { TestBed } from '@angular/core/testing';

import { CampaignService } from './campaign';
import { Campaign } from '../models/campaign';

const STORAGE_KEY = 'dnd.campaigns';

const stored: Campaign[] = [
  {
    id: 'c-1',
    name: 'A campaign a User recorded',
    description: 'Its premise.',
    dm: 'Morgan',
    players: ['Dylan', 'Eve'],
    notes: 'Where it has got to.',
  },
];

describe('CampaignService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no campaigns when storage is empty', () => {
    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });

  it('loads campaigns from storage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual(stored);
  });

  it('starts empty when storage is damaged', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');

    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });

  it('starts empty when storage holds something that is not a list', () => {
    localStorage.setItem(STORAGE_KEY, 'null');

    const service = TestBed.inject(CampaignService);

    expect(service.campaigns()).toEqual([]);
  });
});
