import { defineStore } from 'pinia';
import { OptivumTimetableInfo } from 'src/api';

export interface ConfigHistory {
  title: string;
  baseUrl: string;
  lastUse: string;
}

export interface Config {
  history: ConfigHistory[];
}

export const useConfigStore = defineStore('config', {
  state: (): Config => ({
    history: [],
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
  },
  persist: true,
});
