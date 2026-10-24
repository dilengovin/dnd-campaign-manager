import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CampaignList } from './campaign-list';
import { CampaignService } from '../services/campaign';

describe('CampaignList', () => {
  let fixture: ComponentFixture<CampaignList>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CampaignList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignList);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function text(): string {
    return fixture.nativeElement.textContent ?? '';
  }

  it('says there are no campaigns yet when the user has recorded none', () => {
    expect(text()).toContain('Campaigns');
    expect(text()).toMatch(/no campaigns yet/i);
  });

  it('offers a way to record the first campaign', () => {
    const cta: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a[href="/campaigns/new"]');

    expect(cta).not.toBeNull();
    expect(cta?.textContent).toMatch(/record a campaign/i);
  });

  it('drops the empty state once a campaign exists', async () => {
    TestBed.inject(CampaignService).create({
      name: 'Curse of Strahd',
      description: 'Gothic horror in Barovia.',
      dm: 'Morgan',
      players: ['Dylan', 'Eve'],
      notes: 'The party has reached the village.',
    });
    await fixture.whenStable();

    expect(text()).not.toMatch(/no campaigns yet/i);
    expect(fixture.nativeElement.querySelector('a[href="/campaigns/new"]')).toBeNull();
  });
});
