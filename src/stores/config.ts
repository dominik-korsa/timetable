import { defineStore } from 'pinia';
import { OptivumTimetableInfo } from 'src/api/optivum';

export interface ConfigHistory {
  title: string;
  baseUrl: string;
  lastUse: string;
}

export interface FavouriteLesson {
  subject: string;
  group: string | undefined;
}

export type Favourite = FavouriteLesson | null;

export interface Config {
  history: ConfigHistory[];
  favourites: Record<string, Favourite | undefined>;
}

export const useConfigStore = defineStore(
  'config',
  {
    state: (): Config => ({
      history: [],
      favourites: {},
    }),
    actions: {
      addHistoryEntry(info: OptivumTimetableInfo) {
        this.history = [
          {
            title: info.title,
            baseUrl: info.baseUrl,
            lastUse: new Date().toISOString(),
          },
          ...this.history.filter((e) => e.baseUrl !== info.baseUrl),
        ];
      },
      removeHistoryEntry(index: number) {
        this.history.splice(index, 1);
      },
      setFavourite(
        umid: string,
        favourite: Favourite | undefined,
      ) {
        this.favourites[umid] = favourite;
      },
    },
    persist: true,
  },
);
