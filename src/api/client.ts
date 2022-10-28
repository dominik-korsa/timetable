import { ComputedRef, inject, InjectionKey } from 'vue';
import { CacheMode } from 'src/api/requests';
import { DefaultsMap, tildeDecode } from 'src/utils';
import { VLoClient } from 'src/api/v-lo';
import { TableData } from 'src/api/common';
import { OptivumClient } from 'src/api/optivum';

export interface ClassListItem {
  value: string;
  name: string;
}

export interface BaseClient {
  tri: string;
  key: string;
  getClassList(cacheMode: CacheMode): Promise<ClassListItem[]>;
  supportsOffsets: boolean;
  getLessons(
    cacheMode: CacheMode,
    classValue: string,
    offset: number,
  ): Promise<TableData>;
}

export type Client = VLoClient | OptivumClient;

export const clientSymbol = Symbol('AP Client Symbol') as InjectionKey<ComputedRef<Client | undefined>>;

export const useClientRef = () => {
  const client = inject(clientSymbol);
  if (client === undefined) throw new Error('Client reference not provided');
  return client;
};

const clientCache = new DefaultsMap<string, Client>((tri: string) => {
  const parts = tri.split(',');
  switch (parts[0]) {
    case 'v-lo': {
      if (parts.length > 1) throw new Error(`Too many parts in TRI "${tri}"`);
      return new VLoClient();
    }
    case 'o': {
      if (parts.length !== 4) throw new Error(`Wrong number of parts in TRI "${tri}"`);
      const [, variant, encodedBaseUrl, encodedListPath] = parts;
      const baseUrl = tildeDecode(encodedBaseUrl);
      const listPath = tildeDecode(encodedListPath);
      switch (variant) {
        case '0': return new OptivumClient(baseUrl, listPath);
        case '1': return new OptivumClient(`http://${baseUrl}`, listPath);
        case '2': return new OptivumClient(`https://${baseUrl}`, listPath);
        default: throw new Error(`Unknown variant "${variant}" in TRI ${tri}`);
      }
    }
  }
  throw new Error(`Unknown variant "${parts[0]}" in TRI "${tri}"`);
});

export const getClient = (tri: string) => clientCache.get(tri);
