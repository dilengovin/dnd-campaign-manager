import { Injectable, signal } from '@angular/core';
import { Campaign } from '../models/campaign';

const SEED: Campaign[] = [
  {
    id: crypto.randomUUID(),
    name: 'Lost Mines of Phandelver',
    description: 'A classic starter campaign in the Sword Coast.',
    dmName: 'You',
    players: ['Alice', 'Bob', 'Charlie'],
    notes: '',
  },
  {
    id: crypto.randomUUID(),
    name: 'Curse of Strahd',
    description: 'A gothic horror campaign set in Barovia.',
    dmName: 'Morgan',
    players: ['Dylan', 'Eve', 'Frank'],
    notes: 'Party just arrived in Vallaki.',
  },
  {
    id: crypto.randomUUID(),
    name: 'Homebrew: Shattered Realms',
    description: 'A custom campaign spanning multiple fractured planes.',
    dmName: 'You',
    players: ['Gina', 'Hector'],
    notes: 'Focus on political intrigue and planar travel.',
  },
];

const STORAGE_KEY = 'dnd.campaigns';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  // Writable — only this class can mutate
  private readonly _campaigns = signal<Campaign[]>([]);
  
  // Read-only — what components consume
  readonly campaigns = this._campaigns.asReadonly();
  
  constructor() {
    const stored = this.load();
    this._campaigns.set(stored.length ? stored : [...SEED]);
    if (!stored.length) this.persist();
  }

  private load(): Campaign[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Campaign[];
    } catch {
      console.warn('Corrupt campaigns in localStorage — starting fresh.');
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._campaigns()));
  }

  create(input: Omit<Campaign, 'id'>): Campaign {
    const campaign: Campaign = { id: crypto.randomUUID(), ...input };
    this._campaigns.update(list => [...list, campaign]);
    this.persist();
    return campaign;
  }

  update(id: string, patch: Partial<Omit<Campaign, 'id'>>): Campaign | null {
    const current = this.getById(id);
    if (!current) return null;

    const updated: Campaign = { ...current, ...patch };
    this._campaigns.update(list => list.map(c => c.id === id ? updated : c));
    this.persist();
    return updated;
  }

  delete(id: string): void {
    this._campaigns.update(list => list.filter(c => c.id !== id));
    this.persist();
  }

  getById(id: string): Campaign | undefined {
    return this._campaigns().find(c => c.id === id);
  }
}