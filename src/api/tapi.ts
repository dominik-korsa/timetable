import { CacheMode, fetchWithCache } from 'src/api/requests';
import { DefaultsMap, notNull } from 'src/utils';

interface TapiSchool {
  rspo_id: number;
  name: string;
  geo_lat: number;
  geo_long: number;
  parent_rspo_id: number | null;
  teryt: string;
  address_street: string;
  address_building_number: string;
  address_apartament_number: string;
  address_zip_code: string;
  address_town: string;
}

interface SchoolListResponse {
  schools: TapiSchool[];
}

const apiOrigin = 'https://tapi.dk-gl.eu';

export const voivodeshipTerytCodes = ['02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32'];

export async function getSchoolListByTeryt(teryt: string) {
  const response = await fetchWithCache(CacheMode.NetworkOnly, `${apiOrigin}/v1/schools?teryt=${teryt}`);
  const data: SchoolListResponse = await response.json();
  const childrenSchools = new DefaultsMap<number, TapiSchool[]>(() => []);
  data.schools.forEach((school) => {
    if (school.parent_rspo_id === null) return;
    childrenSchools.get(school.parent_rspo_id).push(school);
  });
  return data.schools.map((school) => {
    if (school.parent_rspo_id !== null) return null;
    return ({
      ...school,
      children: childrenSchools.get(school.rspo_id),
    });
  }).filter(notNull);
}
