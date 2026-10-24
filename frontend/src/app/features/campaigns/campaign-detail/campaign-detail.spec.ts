import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CampaignDetail } from './campaign-detail';
import { aCampaign } from '../campaign.fixture';
import { Campaign, CampaignDraft } from '../models/campaign';
import { CampaignService } from '../services/campaign';

describe('CampaignDetail', () => {
  let fixture: ComponentFixture<CampaignDetail>;
  let service: CampaignService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CampaignDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignDetail);
    service = TestBed.inject(CampaignService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  /** Opens the detail page on a Campaign, the way the route does. */
  async function open(overrides: Partial<CampaignDraft> = {}): Promise<Campaign> {
    const campaign = service.create(aCampaign(overrides));
    fixture.componentRef.setInput('id', campaign.id);
    await fixture.whenStable();
    return campaign;
  }

  function text(): string {
    return fixture.nativeElement.textContent ?? '';
  }

  it('shows the name of the campaign it was opened on', async () => {
    await open({ name: 'Tomb of Annihilation' });

    expect(text()).toContain('Tomb of Annihilation');
  });

  it('shows the description, so a user can remind themselves of the premise', async () => {
    await open({ description: 'Gothic horror in Barovia.' });

    expect(text()).toContain('Gothic horror in Barovia.');
  });

  it('shows who runs the campaign', async () => {
    await open({ dm: 'Morgan' });

    expect(text()).toContain('Morgan');
  });

  it('shows the notes in full, however long they have grown', async () => {
    const notes = [
      'Session 11: the party arrived in Vallaki.',
      'Session 12: Ireena joined them at the Blue Water Inn.',
    ].join('\n');

    await open({ notes });

    expect(text()).toContain('Session 11: the party arrived in Vallaki.');
    expect(text()).toContain('Session 12: Ireena joined them at the Blue Water Inn.');
  });

  it('lists every player by name rather than merely counting them', async () => {
    await open({ players: ['Dylan', 'Eve', 'Sam'] });

    const names = [...fixture.nativeElement.querySelectorAll('.player')].map(
      (el: Element) => el.textContent?.trim(),
    );

    expect(names).toEqual(['Dylan', 'Eve', 'Sam']);
  });

  it('offers a way back to the list, so a user is never stranded', async () => {
    await open();

    const back: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href="/campaigns"]');

    expect(back).not.toBeNull();
    expect(back.textContent).toMatch(/campaigns/i);
  });

  it('says a description was never written rather than showing a blank gap', async () => {
    await open({ description: '' });

    expect(fixture.nativeElement.querySelector('.description')?.textContent).toMatch(
      /no description recorded/i,
    );
  });

  it('says no dungeon master was recorded rather than showing a blank gap', async () => {
    await open({ dm: '' });

    expect(fixture.nativeElement.querySelector('.dm')?.textContent).toMatch(
      /no dungeon master recorded/i,
    );
  });

  it('says the notes are empty rather than showing a blank gap', async () => {
    await open({ notes: '' });

    expect(fixture.nativeElement.querySelector('.notes')?.textContent).toMatch(
      /nothing written yet/i,
    );
  });

  it('says there are no players rather than showing an empty list', async () => {
    await open({ players: [] });

    expect(fixture.nativeElement.querySelector('.players')?.textContent).toMatch(
      /no players recorded/i,
    );
    expect(fixture.nativeElement.querySelector('.player-list')).toBeNull();
  });

  it('says so rather than crashing when asked for a campaign that does not exist', async () => {
    fixture.componentRef.setInput('id', 'no-such-id');
    await fixture.whenStable();

    expect(text()).toMatch(/campaign could not be found/i);
  });

  it('still offers the way back when the campaign does not exist', async () => {
    fixture.componentRef.setInput('id', 'no-such-id');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('a[href="/campaigns"]')).not.toBeNull();
  });
});
