import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { CampaignForm } from './campaign-form';
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

  async function typeName(value: string): Promise<void> {
    const input = nameInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('refuses to record a campaign with no name', async () => {
    expect(submitButton().disabled).toBe(true);

    await fixture.componentInstance.record();

    expect(service.campaigns()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refuses a name that is nothing but whitespace', async () => {
    await typeName('   ');

    expect(submitButton().disabled).toBe(true);

    await fixture.componentInstance.record();

    expect(service.campaigns()).toEqual([]);
  });

  it('records the campaign and returns the user to the list', async () => {
    await typeName('Curse of Strahd');

    expect(submitButton().disabled).toBe(false);

    await fixture.componentInstance.record();

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
});
