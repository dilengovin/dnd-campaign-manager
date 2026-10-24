import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CampaignList } from './campaign-list';
import { CampaignService } from '../services/campaign';
import { aCampaign } from '../campaign.fixture';

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

  function cardText(): string {
    return fixture.nativeElement.querySelector('.campaign-card')?.textContent ?? '';
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
    expect([...cards].map((c: Element) => c.querySelector('.campaign-name')?.textContent?.trim()))
      .toEqual(['Curse of Strahd', 'Tomb of Annihilation']);
  });

  it('shows the dungeon master on the card, so a user can tell their campaigns apart', async () => {
    TestBed.inject(CampaignService).create(aCampaign({ dm: 'Morgan' }));
    await fixture.whenStable();

    expect(cardText()).toContain('Morgan');
  });

  it('says so rather than showing a gap when no dungeon master was recorded', async () => {
    TestBed.inject(CampaignService).create(aCampaign({ dm: '' }));
    await fixture.whenStable();

    expect(cardText()).toMatch(/no dungeon master recorded/i);
  });

  it('shows how many players are at the table', async () => {
    TestBed.inject(CampaignService).create(aCampaign({ players: ['Dylan', 'Eve', 'Sam'] }));
    await fixture.whenStable();

    expect(cardText()).toContain('3 players');
  });

  it('counts a party of one as a player, not players', async () => {
    TestBed.inject(CampaignService).create(aCampaign({ players: ['Dylan'] }));
    await fixture.whenStable();

    expect(cardText()).toContain('1 player');
    expect(cardText()).not.toContain('1 players');
  });

  it('counts an empty party as none rather than leaving it unsaid', async () => {
    TestBed.inject(CampaignService).create(aCampaign({ players: [] }));
    await fixture.whenStable();

    expect(cardText()).toContain('0 players');
  });

  it('lets a user open a campaign from its card', async () => {
    const campaign = TestBed.inject(CampaignService).create(aCampaign());
    await fixture.whenStable();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      `.campaign-card a[href="/campaigns/${campaign.id}"]`,
    );

    expect(link).not.toBeNull();
    expect(link.textContent?.trim()).toBe('Curse of Strahd');
  });

  describe('removing a campaign', () => {
    let service: CampaignService;

    beforeEach(() => {
      service = TestBed.inject(CampaignService);
    });

    /** The remove control on the card for a named Campaign, whatever it currently says. */
    function removeControl(name: string): HTMLButtonElement {
      const card = [...fixture.nativeElement.querySelectorAll('.campaign-card')].find(
        (el: Element) => el.querySelector('.campaign-name')?.textContent?.includes(name),
      ) as Element;

      return card.querySelector('.remove') as HTMLButtonElement;
    }

    function confirmControl(name: string): HTMLButtonElement | null {
      const card = [...fixture.nativeElement.querySelectorAll('.campaign-card')].find(
        (el: Element) => el.querySelector('.campaign-name')?.textContent?.includes(name),
      ) as Element;

      return card.querySelector('.confirm-remove');
    }

    async function click(button: HTMLElement): Promise<void> {
      button.click();
      await fixture.whenStable();
    }

    async function listing(...names: string[]): Promise<void> {
      for (const name of names) service.create(aCampaign({ name }));
      await fixture.whenStable();
    }

    function names(): string[] {
      return [...fixture.nativeElement.querySelectorAll('.campaign-name')].map(
        (el: Element) => el.textContent?.trim() ?? '',
      );
    }

    it('offers a way to remove each campaign', async () => {
      await listing('Curse of Strahd');

      expect(removeControl('Curse of Strahd')).not.toBeNull();
    });

    it('removes nothing on the first activation — it asks instead', async () => {
      await listing('Curse of Strahd');

      await click(removeControl('Curse of Strahd'));

      expect(service.campaigns()).toHaveLength(1);
      expect(names()).toEqual(['Curse of Strahd']);
      expect(confirmControl('Curse of Strahd')).not.toBeNull();
    });

    it('removes the campaign on the second activation', async () => {
      await listing('Curse of Strahd');

      await click(removeControl('Curse of Strahd'));
      await click(confirmControl('Curse of Strahd')!);

      expect(service.campaigns()).toEqual([]);
      expect(names()).toEqual([]);
    });

    it('removes only the campaign that was asked about', async () => {
      await listing('Curse of Strahd', 'Tomb of Annihilation');

      await click(removeControl('Curse of Strahd'));
      await click(confirmControl('Curse of Strahd')!);

      expect(names()).toEqual(['Tomb of Annihilation']);
    });

    it('can be backed out of, leaving the campaign and the list as they were', async () => {
      await listing('Curse of Strahd');

      await click(removeControl('Curse of Strahd'));
      await click(fixture.nativeElement.querySelector('.cancel-remove'));

      expect(service.campaigns()).toHaveLength(1);
      expect(names()).toEqual(['Curse of Strahd']);
    });

    it('leaves no trace of an abandoned removal', async () => {
      await listing('Curse of Strahd');

      await click(removeControl('Curse of Strahd'));
      await click(fixture.nativeElement.querySelector('.cancel-remove'));

      expect(confirmControl('Curse of Strahd')).toBeNull();
      expect(fixture.nativeElement.querySelector('.cancel-remove')).toBeNull();
    });

    it('asks on the card that was clicked and on no other', async () => {
      await listing('Curse of Strahd', 'Tomb of Annihilation');

      await click(removeControl('Curse of Strahd'));

      expect(confirmControl('Curse of Strahd')).not.toBeNull();
      expect(confirmControl('Tomb of Annihilation')).toBeNull();
    });

    it('moves the question to the other card when a user asks about that one instead', async () => {
      await listing('Curse of Strahd', 'Tomb of Annihilation');

      await click(removeControl('Curse of Strahd'));
      await click(removeControl('Tomb of Annihilation'));

      expect(confirmControl('Curse of Strahd')).toBeNull();
      expect(confirmControl('Tomb of Annihilation')).not.toBeNull();
    });
  });
});
