import { UnitType } from 'src/api/common';

export interface ConfigHistoryV1 {
  title: string;
  baseUrl: string;
  listPath: string;
  lastUse: string;

  logoSrc?: string | undefined;
}

export interface FavouriteLessonV1 {
  subject: string;
  group: string | undefined;
}

export interface StartupUnitV1 {
  tri: string,
  unitType: UnitType;
  unit: string;
}

export interface ConfigV1 {
  version: 1;
  optivumHistory: ConfigHistoryV1[];
  favouriteLessons: Record<string, FavouriteLessonV1 | null | undefined>;
  favouriteUnits: Record<string, { unitType: UnitType; unit: string; }[]>;
  startupUnit: StartupUnitV1 | null;
  dark: boolean | 'auto';
  superSecretSettingsEnabled: boolean;
  scrollSnap: boolean;
  iso8601: boolean;
  showColors: boolean;
  dense: boolean;
  combinedTimetableScroll: Record<string, number>;
}
