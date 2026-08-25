import { Injectable, signal } from '@angular/core';
import { Campaign } from '../models/campaign';

const STORAGE_KEY = 'dnd.campaigns';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  // Writable — only this class can mutate
  private readonly _campaigns = signal<Campaign[]>([]);
  
  // Read-only — what components consume
  readonly campaigns = this._campaigns.asReadonly();
  
  constructor() {
    this._campaigns.set(this.load());
  }

  private load(): Campaign[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('not a list of campaigns');
      return parsed as Campaign[];
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