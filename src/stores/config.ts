import { defineStore } from 'pinia';
import _ from 'lodash';
import { Temporal } from '@js-temporal/polyfill';
import { OptivumTimetableInfo } from 'src/api/optivum';

export interface ConfigHistory {
  title: string;
  baseUrl: string;
  listPath: string;
  lastUse: string;
}

export interface FavouriteLesson {
  subject: string;
  group: string | undefined;
}

export interface StartupTable {
  baseUrl: string | undefined,
  classValue: string,
}

export interface Config {
  history: ConfigHistory[];
  favouriteLessons: Record<string, FavouriteLesson | null | undefined>;
  favouriteTables: Record<string, string[]>;
  startupTable: StartupTable | null;
  dark: boolean | 'auto';
  superSecretSettingsEnabled: boolean;
  scrollSnap: boolean;
  iso8601: boolean;
  showColors: boolean;
}

export const useConfigStore = defineStore('config', {
  state: (): Config => ({
    history: [],
    favouriteLessons: {},
    favouriteTables: {},
    startupTable: null,
    dark: 'auto',
    superSecretSettingsEnabled: false,
    scrollSnap: true,
    iso8601: false,
    showColors: true,
  }),
  actions: {
    addHistoryEntry(info: OptivumTimetableInfo) {
      this.history = [
        {
          title: info.title,
          baseUrl: info.baseUrl,
          listPath: info.listPath,
          lastUse: Temporal.Now.instant.toString(),
        },
        ...this.history.filter((e) => e.baseUrl !== info.baseUrl),
      ];
    },
    removeHistoryEntry(index: number) {
      this.history.splice(index, 1);
    },
    setFavourite(
      umid: string,
      favourite: FavouriteLesson | null | undefined,
    ) {
      this.favouriteLessons[umid] = favourite;
    },
    addFavouriteTable(baseUrl: string | undefined, classValue: string) {
      const key = baseUrl ?? 'v-lo';
      let list = this.favouriteTables[key];
      if (list === undefined) {
        list = [];
        this.favouriteTables[key] = list;
      }
      list.push(classValue);
    },
    removeFavouriteTable(baseUrl: string | undefined, classValue: string) {
      const key = baseUrl ?? 'v-lo';
      const list = this.favouriteTables[key];
      if (list === undefined) return;
      _.pull(list, classValue);
      if (list.length === 0) delete this.favouriteTables[key];
    },
    setStartupTable(table: StartupTable | null) {
      this.startupTable = table;
    },
    setDark(dark: boolean | 'auto') {
      this.dark = dark;
    },
    setSuperSecretSettings(enabled: boolean) {
      this.superSecretSettingsEnabled = enabled;
    },
    setScrollSnap(enabled: boolean) {
      this.scrollSnap = enabled;
    },
    setISO8601(enabled: boolean) {
      this.iso8601 = enabled;
    },
    toggleColors() {
      this.showColors = !this.showColors;
    },
  },
  persist: true,
});
