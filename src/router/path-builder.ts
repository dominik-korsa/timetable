import { UnitType } from 'src/api/common';

const pathSymbol = Symbol('Path type symbol');
export type Path = string & {
  [pathSymbol]: true,
}

export const paths = {
  home: '/' as Path,
  superSecretSettings: '/super-secret-settings' as Path,
  schoolMap: '/school-map' as Path,
  tri: (tri: string) => {
    const triPrefix = `/${tri}/`;
    const unitType = (type: UnitType) => {
      const unitPrefix = `${triPrefix}${type}/`;
      return {
        list: unitPrefix as Path,
        id: (id: string) => `${unitPrefix}${encodeURIComponent(id)}` as Path,
      };
    };
    return {
      school: triPrefix as Path,
      unitType,
      class: unitType('class'),
      teacher: unitType('teacher'),
      room: unitType('room'),
      combined: `${triPrefix}combined`,
    };
  },
};
