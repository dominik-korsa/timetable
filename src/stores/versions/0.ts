export interface ConfigHistoryV0 {
  title: string;
  baseUrl: string;
  lastUse: string;
}

export interface FavouriteLessonV0 {
  subject: string;
  group: string | undefined;
}

export interface StartupTableV0 {
  baseUrl: string | undefined,
  classValue: string,
}

export interface ConfigV0 {
  history: ConfigHistoryV0[];
  favouriteLessons: Record<string, FavouriteLessonV0 | null | undefined>;
  favouriteTables: Record<string, string[]>;
  startupTable: StartupTableV0 | null;
  dark: boolean | 'auto';
  superSecretSettingsEnabled: boolean;
  scrollSnap: boolean;
  iso8601: boolean;
  showColors: boolean;
}
