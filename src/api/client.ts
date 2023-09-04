import { ComputedRef, inject, InjectionKey } from 'vue';
import { CacheMode } from 'src/api/requests';
import { bangDecode, DefaultsMap } from 'src/utils';
import { VLoClient } from 'src/api/v-lo';
import { AllClassesLessons, TableDataWithTimeSlots, UnitType } from 'src/api/common';
import { OptivumClient } from 'src/api/optivum';
import { Temporal } from '@js-temporal/polyfill';
import PlainDate = Temporal.PlainDate;

export interface UnitListItem {
  unit: string;
  name: string;
}

export interface UnitLists {
  classes: UnitListItem[];

  teachers?: UnitListItem[];

  rooms?: UnitListItem[];
}

export interface BaseClient {
  tri: string;
  key: string;
  getUnitLists(cacheMode: CacheMode): Promise<UnitLists>;
  getTitle(cacheMode: CacheMode): Promise<string>;
  supportsOffsets: boolean;
  getLessons(
    fromCache: boolean,
    unitType: UnitType,
    unit: string,
    monday: Temporal.PlainDate,
  ): Promise<TableDataWithTimeSlots>;
  getLessonsOfAllClasses(fromCache: boolean, monday: PlainDate): Promise<AllClassesLessons>;
  getUnitNameMapper(cacheMode: CacheMode): Promise<(unitType: UnitType, unit: string) => string>;
}

export type Client = VLoClient | OptivumClient;

export const clientSymbol = Symbol('API Client Symbol') as InjectionKey<ComputedRef<Client | undefined>>;

export const useClientRef = () => {
  const client = inject(clientSymbol);
  if (client === undefined) throw new Error('Client reference not provided');
  return client;
};

const clientCache = new DefaultsMap<string, Client>((tri: string) => {
  if (tri === 'v-lo') return new VLoClient();
  if (tri.startsWith('o,')) {
    const parts = tri.split(',');
    if (parts.length !== 4) throw new Error(`Wrong number of parts in TRI "${tri}"`);
    const [, variant, encodedBaseUrl, encodedListPath] = parts;
    const baseUrl = bangDecode(encodedBaseUrl);
    const listPath = bangDecode(encodedListPath);
    switch (variant) {
      case '0': return new OptivumClient(baseUrl, listPath);
      case '1': return new OptivumClient(`http://${baseUrl}`, listPath);
      case '2': return new OptivumClient(`https://${baseUrl}`, listPath);
      default: throw new Error(`Unknown second part ${JSON.stringify(variant)} of TRI ${tri}`);
    }
  }
  if (tri.startsWith('\'') && tri.endsWith('\'')) {
    console.log(tri.substring(1, tri.length - 1));
    throw new Error('URL TRIs are not implemented yet');
  }
  throw new Error(`Unknown variant of TRI ${JSON.stringify(tri)}`);
});

export const getClient = (tri: string) => clientCache.get(tri);
