import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { CampaignForm } from './campaign-form';
import { aCampaign } from '../campaign.fixture';
import { Campaign, CampaignDraft } from '../models/campaign';
import { CampaignService } from '../services/campaign';

describe('CampaignForm', () => {
  let fixture: ComponentFixture<CampaignForm>;
  let service: CampaignService;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CampaignForm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignForm);
    service = TestBed.inject(CampaignService);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function nameInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#name');
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  /** Clicks the submit button, which is what a User does. */
  async function clickSubmit(): Promise<void> {
    submitButton().click();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
  }

  async function typeName(value: string): Promise<void> {
    const input = nameInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function typeInto(selector: string, value: string): Promise<void> {
    const control: HTMLInputElement | HTMLTextAreaElement =
      fixture.nativeElement.querySelector(selector);
    control.value = value;
    control.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  /** Types a name into the add-a-player field and activates the add action. */
  async function addPlayer(name: string): Promise<void> {
    await typeInto('#player-to-add', name);
    fixture.nativeElement.querySelector('button.add').click();
    await fixture.whenStable();
  }

  function playerNames(): string[] {
    return [...fixture.nativeElement.querySelectorAll('.player-name')].map(
      (el: Element) => el.textContent?.trim() ?? '',
    );
  }

  async function removePlayer(name: string): Promise<void> {
    fixture.nativeElement.querySelector(`button[aria-label="Remove ${name}"]`).click();
    await fixture.whenStable();
  }

  it('refuses to record a campaign with no name', async () => {
    expect(submitButton().disabled).toBe(true);

    await clickSubmit();

    expect(service.campaigns()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refuses a name that is nothing but whitespace', async () => {
    await typeName('   ');

    expect(submitButton().disabled).toBe(true);

    await clickSubmit();

    expect(service.campaigns()).toEqual([]);
  });

  it('records the campaign and returns the user to the list', async () => {
    await typeName('Curse of Strahd');

    expect(submitButton().disabled).toBe(false);

    await clickSubmit();

    expect(service.campaigns()).toHaveLength(1);
    expect(service.campaigns()[0].name).toBe('Curse of Strahd');
    expect(navigate).toHaveBeenCalledWith(['/campaigns']);
  });

  it('records nothing merely because the form was filled in', async () => {
    await typeName('Curse of Strahd');

    expect(service.campaigns()).toEqual([]);
  });

  it('offers a way back to the list that is not recording', () => {
    const cancel: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href="/campaigns"]');

    expect(cancel).not.toBeNull();
    expect(cancel.textContent).toMatch(/cancel/i);
  });

  it('records a campaign with nothing but a name, because nothing else is required', async () => {
    await typeName('Curse of Strahd');

    expect(submitButton().disabled).toBe(false);

    await clickSubmit();

    expect(service.campaigns()).toEqual([
      {
        id: expect.any(String),
        name: 'Curse of Strahd',
        description: '',
        dm: '',
        players: [],
        notes: '',
      },
    ]);
  });

  it('records the description, the dungeon master and the notes alongside the name', async () => {
    await typeName('Curse of Strahd');
    await typeInto('#description', 'Gothic horror in Barovia.');
    await typeInto('#dm', 'Morgan');
    await typeInto('#notes', 'The party has reached the village.');

    await clickSubmit();

    expect(service.campaigns()[0]).toMatchObject({
      description: 'Gothic horror in Barovia.',
      dm: 'Morgan',
      notes: 'The party has reached the village.',
    });
  });

  it('shows each player as they are added', async () => {
    await addPlayer('Dylan');
    await addPlayer('Eve');

    expect(playerNames()).toEqual(['Dylan', 'Eve']);
  });

  it('clears the add-a-player field so the next name can be typed straight in', async () => {
    await addPlayer('Dylan');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#player-to-add');
    expect(input.value).toBe('');
  });

  it('adds nothing when the add-a-player field is empty', async () => {
    await addPlayer('   ');

    expect(playerNames()).toEqual([]);
  });

  it('removes one player without disturbing the others', async () => {
    await addPlayer('Dylan');
    await addPlayer('Eve');
    await addPlayer('Sam');

    await removePlayer('Eve');

    expect(playerNames()).toEqual(['Dylan', 'Sam']);
  });

  it('removes the right player when two share a name', async () => {
    await addPlayer('Dylan');
    await addPlayer('Dylan');

    fixture.nativeElement.querySelectorAll('button.remove-player')[0].click();
    await fixture.whenStable();

    expect(playerNames()).toEqual(['Dylan']);
  });

  it('records a player name containing punctuation exactly as it was typed', async () => {
    await typeName('Curse of Strahd');
    await addPlayer("Ireena Kolyana, the Burgomaster's daughter");

    await clickSubmit();

    expect(service.campaigns()[0].players).toEqual([
      "Ireena Kolyana, the Burgomaster's daughter",
    ]);
  });

  it('records the players that were added', async () => {
    await typeName('Curse of Strahd');
    await addPlayer('Dylan');
    await addPlayer('Eve');

    await clickSubmit();

    expect(service.campaigns()[0].players).toEqual(['Dylan', 'Eve']);
  });

  it('still refuses a campaign with no name, however much else is filled in', async () => {
    await typeInto('#description', 'Gothic horror in Barovia.');
    await typeInto('#dm', 'Morgan');
    await addPlayer('Dylan');

    expect(submitButton().disabled).toBe(true);

    await clickSubmit();

    expect(service.campaigns()).toEqual([]);
  });

  describe('editing a campaign that already exists', () => {

    /** Opens the form on an existing Campaign, the way the edit route does. */
    async function openForEditing(
      overrides: Partial<CampaignDraft> = {},
    ): Promise<Campaign> {
      const campaign = service.create(aCampaign(overrides));
      fixture.componentRef.setInput('id', campaign.id);
      await fixture.whenStable();
      return campaign;
    }

    function valueOf(selector: string): string {
      return (fixture.nativeElement.querySelector(selector) as HTMLInputElement).value;
    }

    it('arrives filled in with the campaign as it stands', async () => {
      await openForEditing();

      expect(valueOf('#name')).toBe('Curse of Strahd');
      expect(valueOf('#description')).toBe('Gothic horror in Barovia.');
      expect(valueOf('#dm')).toBe('Morgan');
      expect(valueOf('#notes')).toBe('The party has reached the village.');
      expect(playerNames()).toEqual(['Dylan', 'Eve']);
    });

    it('saves a changed name onto the campaign rather than recording a second one', async () => {
      const campaign = await openForEditing();

      await typeName('Curse of Strahd (Thursdays)');
      await clickSubmit();

      expect(service.campaigns()).toHaveLength(1);
      expect(service.getById(campaign.id)?.name).toBe('Curse of Strahd (Thursdays)');
    });

    it('writes up a session in the notes', async () => {
      const campaign = await openForEditing();

      await typeInto('#notes', 'The party has entered the castle.');
      await clickSubmit();

      expect(service.getById(campaign.id)?.notes).toBe('The party has entered the castle.');
    });

    it('adds a player who joined', async () => {
      const campaign = await openForEditing();

      await addPlayer('Sam');
      await clickSubmit();

      expect(service.getById(campaign.id)?.players).toEqual(['Dylan', 'Eve', 'Sam']);
    });

    it('removes a player who left', async () => {
      const campaign = await openForEditing();

      await removePlayer('Dylan');
      await clickSubmit();

      expect(service.getById(campaign.id)?.players).toEqual(['Eve']);
    });

    it('leaves the campaign untouched until the changes are saved', async () => {
      const campaign = await openForEditing();

      await typeName('Something else entirely');
      await addPlayer('Sam');

      expect(service.getById(campaign.id)).toEqual({ id: campaign.id, ...aCampaign() });
    });

    it('still requires a name', async () => {
      const campaign = await openForEditing();

      await typeName('   ');

      expect(submitButton().disabled).toBe(true);

      await clickSubmit();

      expect(service.getById(campaign.id)?.name).toBe('Curse of Strahd');
    });

    it('returns the user to the campaign, where the change is there to see', async () => {
      const campaign = await openForEditing();

      await typeName('Curse of Strahd (Thursdays)');
      await clickSubmit();

      expect(navigate).toHaveBeenCalledWith(['/campaigns', campaign.id]);
    });

    it('offers a way out that goes back to the campaign without saving', async () => {
      const campaign = await openForEditing();

      const cancel: HTMLAnchorElement = fixture.nativeElement.querySelector(
        `a[href="/campaigns/${campaign.id}"]`,
      );

      expect(cancel).not.toBeNull();
      expect(cancel.textContent).toMatch(/cancel/i);
    });
  });

  describe('editing a campaign that is not there', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('id', 'no-such-id');
      await fixture.whenStable();
    });

    it('says so rather than offering a form that would discard the work', () => {
      expect(fixture.nativeElement.textContent).toMatch(/campaign could not be found/i);
      expect(fixture.nativeElement.querySelector('#name')).toBeNull();
    });

    it('offers a way back to the list', () => {
      expect(fixture.nativeElement.querySelector('a[href="/campaigns"]')).not.toBeNull();
    });
  });
});
