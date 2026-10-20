import Dexie, { type EntityTable } from 'dexie';
import { create } from 'zustand';
import { initialProgress, type Progress } from './model';

class LocalDatabase extends Dexie {
  snapshots!: EntityTable<{ id: string; data: Progress }, 'id'>;
  constructor() {
    super('geekcode');
    this.version(1).stores({ snapshots: 'id' });
  }
}
const db = new LocalDatabase();
let pendingSave: Promise<void> = Promise.resolve();
interface Store {
  progress: Progress;
  ready: boolean;
  error: string;
  toast: string;
  update: (edit: (next: Progress) => void) => void;
  replace: (data: Progress) => Promise<void>;
  notify: (message: string) => void;
  clearError: () => void;
}
export const useStore = create<Store>((set, get) => ({
  progress: initialProgress(),
  ready: false,
  error: '',
  toast: '',
  update: (edit) => {
    const next = structuredClone(get().progress);
    edit(next);
    set({ progress: next });
    pendingSave = pendingSave
      .then(async () => {
        await db.snapshots.put({ id: 'progress', data: next });
      })
      .catch((error: unknown) => {
        set({
          error: `Progress could not be saved: ${error instanceof Error ? error.message : String(error)}. Export a backup before closing this tab.`,
        });
      });
  },
  replace: async (data) => {
    await pendingSave;
    await db.snapshots.put({ id: 'progress', data });
    set({ progress: data });
  },
  notify: (toast) => set({ toast }),
  clearError: () => set({ error: '' }),
}));
export async function hydrate(): Promise<void> {
  try {
    const saved = await db.snapshots.get('progress');
    useStore.setState({
      progress: saved ? { ...initialProgress(), ...saved.data } : initialProgress(),
      ready: true,
    });
  } catch (error) {
    useStore.setState({
      ready: true,
      error: `Local storage is unavailable: ${error instanceof Error ? error.message : String(error)}. Changes are in memory only; export regularly.`,
    });
  }
}
