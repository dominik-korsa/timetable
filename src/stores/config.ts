import { defineStore } from 'pinia';
import { Temporal } from '@js-temporal/polyfill';
import { OptivumTimetableInfo } from 'src/api/optivum';
import { UnitType } from 'src/api/common';

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

export interface StartupUnit {
  tri: string,
  unitType: UnitType;
  unit: string;
}

export interface Config {
  optivumHistory: ConfigHistory[];
  favouriteLessons: Record<string, FavouriteLesson | null | undefined>;
  favouriteUnits: Record<string, { unitType: UnitType; unit: string; }[]>;
  startupUnit: StartupUnit | null;
  dark: boolean | 'auto';
  superSecretSettingsEnabled: boolean;
  scrollSnap: boolean;
  iso8601: boolean;
  showColors: boolean;
}

export const useConfigStore = defineStore('config', {
  state: (): Config => ({
    optivumHistory: [],
    favouriteLessons: {},
    favouriteUnits: {},
    startupUnit: null,
    dark: 'auto',
    superSecretSettingsEnabled: false,
    scrollSnap: true,
    iso8601: false,
    showColors: true,
  }),
  actions: {
    addHistoryEntry(info: OptivumTimetableInfo) {
      this.optivumHistory = [
        {
          title: info.title,
          baseUrl: info.baseUrl,
          listPath: info.listPath,
          lastUse: Temporal.Now.instant.toString(),
        },
        ...this.optivumHistory.filter((e) => e.baseUrl !== info.baseUrl),
      ];
    },
    removeHistoryEntry(index: number) {
      this.optivumHistory.splice(index, 1);
    },
    setFavourite(
      umid: string,
      favourite: FavouriteLesson | null | undefined,
    ) {
      this.favouriteLessons[umid] = favourite;
    },
    addFavouriteTable(tri: string, unitType: UnitType, unit: string) {
      let list = this.favouriteUnits[tri];
      if (list === undefined) {
        list = [];
        this.favouriteUnits[tri] = list;
      }
      list.push({ unitType, unit });
    },
    removeFavouriteTable(tri: string, unitType: UnitType, unit: string) {
      this.favouriteUnits[tri] = this.favouriteUnits[tri]?.filter(
        (item) => item.unitType !== unitType || item.unit !== unit,
      ) ?? [];
      if (this.favouriteUnits[tri].length === 0) delete this.favouriteUnits[tri];
    },
    setStartupTable(table: StartupUnit | null) {
      this.startupUnit = table;
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
  persist: {
    beforeRestore: (ctx) => {
      console.log(ctx);
      console.log(`about to restore '${ctx.store.$id}'`);
    },
  },
});
