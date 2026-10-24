import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CampaignList } from './campaign-list';
import { CampaignService } from '../services/campaign';
import { Campaign } from '../models/campaign';

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

  /** A Campaign as a User would record it, before it has an id. */
  function aCampaign(overrides: Partial<Omit<Campaign, 'id'>> = {}): Omit<Campaign, 'id'> {
    return {
      name: 'Curse of Strahd',
      description: 'Gothic horror in Barovia.',
      dm: 'Morgan',
      players: ['Dylan', 'Eve'],
      notes: 'The party has reached the village.',
      ...overrides,
    };
  }

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
    TestBed.inject(CampaignService).create(aCampaign());
    await fixture.whenStable();

    expect(text()).not.toMatch(/no campaigns yet/i);
  });

  it('keeps the way to record a campaign once the list is no longer empty', async () => {
    TestBed.inject(CampaignService).create(aCampaign());
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('a[href="/campaigns/new"]')).not.toBeNull();
  });

  it('renders one card per campaign, each showing its name', async () => {
    const service = TestBed.inject(CampaignService);
    service.create(aCampaign({ name: 'Curse of Strahd' }));
    service.create(aCampaign({ name: 'Tomb of Annihilation' }));
    await fixture.whenStable();

    const cards = fixture.nativeElement.querySelectorAll('.campaign-card');

    expect(cards).toHaveLength(2);
    expect([...cards].map((c: Element) => c.textContent?.trim())).toEqual([
      'Curse of Strahd',
      'Tomb of Annihilation',
    ]);
  });
});
