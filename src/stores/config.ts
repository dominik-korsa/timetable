import { defineStore } from 'pinia';
import { Temporal } from '@js-temporal/polyfill';
import { OptivumTimetableInfo } from 'src/api/optivum';
import { UnitType } from 'src/api/common';
import {
  ConfigHistoryV1, ConfigV1, FavouriteLessonV1, StartupUnitV1,
} from 'stores/versions/1';
import { ConfigV0 } from 'stores/versions/0';
import _ from 'lodash';

export type ConfigHistory = ConfigHistoryV1;
export type StartupUnit = StartupUnitV1;
export type FavouriteLesson = FavouriteLessonV1;
export type Config = ConfigV1;

export type ConfigAnyVersion = ConfigV0 | ConfigV1;

export const useConfigStore = defineStore('config', {
  state: (): Config => ({
    version: 1,
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
    beforeRestore: (/* ctx */) => {
      const json = window.localStorage.getItem('config');
      if (json === null) return;
      let content = JSON.parse(json) as ConfigAnyVersion;
      if ('version' in content && content.version === 1) return;
      if (!('version' in content)) {
        content = {
          version: 1,
          favouriteLessons: _.mapKeys(content.favouriteLessons, (value, key) => {
            const [baseUrl, classValue, day, hour] = key.split('|').map((e) => decodeURIComponent(e));
            return `${encodeURIComponent(baseUrl === 'v-lo' ? 'v-lo' : `o,${baseUrl}`)}|class|${encodeURIComponent(classValue)}|${day}|${hour}|#`;
          }),
          optivumHistory: [],
          dark: content.dark,
          iso8601: content.iso8601,
          scrollSnap: content.scrollSnap,
          showColors: content.showColors,
          superSecretSettingsEnabled: content.superSecretSettingsEnabled,
          startupUnit:
            content.startupTable !== null && content.startupTable.baseUrl === undefined ? {
              tri: 'v-lo',
              unitType: 'class',
              unit: content.startupTable.classValue,
            } : null,
          favouriteUnits: {},
        };
      }
      window.localStorage.setItem('config', JSON.stringify(content));
    },
  },
});
