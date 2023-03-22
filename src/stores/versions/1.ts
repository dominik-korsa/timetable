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

interface StartupUnitV1 {
  tri: string,
  unitType: UnitType;
  unit: string;
}

interface StartupCombinedV1 {
  tri: string;

  unitType: 'combined';
}

export type Startup = StartupUnitV1 | StartupCombinedV1;

export interface ConfigV1 {
  version: 1;
  optivumHistory: ConfigHistoryV1[];
  favouriteLessons: Record<string, FavouriteLessonV1 | null | undefined>;
  favouriteUnits: Record<string, { unitType: UnitType; unit: string; }[]>;
  startupUnit: Startup | null;
  dark: boolean | 'auto';
  superSecretSettingsEnabled: boolean;
  scrollSnap: boolean;
  iso8601: boolean;
  showColors: boolean;
  dense: boolean;
  combinedTimetableScroll: Record<string, number>;
}
