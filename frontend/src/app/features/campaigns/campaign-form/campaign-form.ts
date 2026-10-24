import { Component, computed, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { FormField, FormRoot, form, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { CampaignDraft } from '../models/campaign';
import { CampaignService } from '../services/campaign';

const NAME_REQUIRED = 'A campaign needs a name.';

const BLANK: CampaignDraft = {
  name: '',
  description: '',
  dm: '',
  players: [],
  notes: '',
};

/**
 * Records a Campaign, or edits one that already exists.
 *
 * Both routes land here because the fields and the name-is-required rule are
 * the same either way; the only difference is where the form starts and where
 * a User is sent afterwards.
 */
@Component({
  selector: 'app-campaign-form',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.scss',
})
export class CampaignForm {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);

  /** Bound from the route's `:id` segment, and absent on the record route. */
  readonly id = input<string>();

  readonly editing = computed(() => this.id() !== undefined);

  /**
   * The Campaign being edited, if it is there to edit.
   *
   * A stale edit link resolves to nothing, and the form must not be offered in
   * that case: `update` would find no Campaign to change and everything the
   * User typed would be dropped on submission without a word.
   */
  private readonly campaignToEdit = computed(() => {
    const id = this.id();
    return id === undefined ? undefined : this.campaignService.getById(id);
  });

  readonly missing = computed(() => this.editing() && this.campaignToEdit() === undefined);

  /**
   * The form starts blank, or filled in with the Campaign being edited.
   *
   * The lookup is untracked deliberately: this should re-run when a User opens
   * the form on a different Campaign, and not when the Campaign itself changes
   * — saving replaces it, which would otherwise reset the form mid-submission.
   */
  private readonly model = linkedSignal<string | undefined, CampaignDraft>({
    source: () => this.id(),
    computation: (id) =>
      untracked(() => {
        const campaign = id === undefined ? undefined : this.campaignService.getById(id);
        if (campaign === undefined) return { ...BLANK };

        const { id: _id, ...draft } = campaign;
        return { ...draft, players: [...draft.players] };
      }),
  });

  readonly campaignForm = form(
    this.model,
    (path) => {
      // `required` for the semantics a screen reader needs; `pattern` because a
      // name of nothing but spaces is as unidentifiable as no name at all.
      // Nothing else is validated: a User who has just agreed to play on
      // Thursday can record the name and come back for the rest.
      required(path.name, { message: NAME_REQUIRED });
      pattern(path.name, /\S/, { message: NAME_REQUIRED });
    },
    {
      submission: {
        action: async () => {
          const draft = { ...this.model(), name: this.model().name.trim() };
          const id = this.id();

          if (id === undefined) {
            this.campaignService.create(draft);
            await this.router.navigate(['/campaigns']);
            return;
          }

          this.campaignService.update(id, draft);
          // Back to the Campaign, where the change is immediately visible.
          await this.router.navigate(['/campaigns', id]);
        },
      },
    },
  );

  /** Where Cancel goes: back where the User came from, having changed nothing. */
  readonly cancelTarget = computed(() => {
    const id = this.id();
    return id === undefined ? ['/campaigns'] : ['/campaigns', id];
  });

  /**
   * The Player about to be added. Deliberately not a form field — it is the
   * input to the add action, not a value the Campaign carries.
   */
  readonly playerToAdd = signal('');

  /** The Players added so far, so a User can see whether they have missed anyone. */
  readonly players = this.campaignForm.players().value.asReadonly();

  onPlayerToAddInput(event: Event): void {
    this.playerToAdd.set((event.target as HTMLInputElement).value);
  }

  /**
   * Players are added one at a time rather than split out of a single field, so
   * a name containing a comma or an apostrophe is recorded exactly as typed.
   */
  addPlayer(): void {
    const name = this.playerToAdd().trim();
    if (!name) return;

    this.updatePlayers((players) => [...players, name]);
    this.playerToAdd.set('');
  }

  removePlayer(index: number): void {
    this.updatePlayers((players) => players.filter((_, i) => i !== index));
  }

  /** The one place the Players field is written. */
  private updatePlayers(change: (players: string[]) => string[]): void {
    this.campaignForm.players().value.update(change);
  }
}
