import { TestBed } from '@angular/core/testing';

import { CampaignService } from './campaign';

describe('CampaignService', () => {
  let service: CampaignService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampaignService);
  });

  it('seeds campaigns when localStorage is empty', () => {
    expect(service.campaigns().length).toBeGreaterThan(0);
  });
});
