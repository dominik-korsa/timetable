import { UnitType } from 'src/api/common';

export const paths = {
  home: '/',
  superSecretSettings: '/super-secret-settings',
  tri: (tri: string) => {
    const triPrefix = `/${tri}/`;
    const unitType = (type: UnitType) => {
      const unitPrefix = `${triPrefix}${type}/`;
      return {
        list: unitPrefix,
        id: (id: string) => `${unitPrefix}${encodeURIComponent(id)}`,
      };
    };
    return {
      school: triPrefix,
      unitType,
      class: unitType('class'),
      teacher: unitType('teacher'),
      room: unitType('room'),
    };
  },
};
