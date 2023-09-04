import { UnitType } from 'src/api/common';

export const paths = {
  home: '/',
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

// TODO: Remove
console.assert(paths.home === '/');
console.assert(paths.tri('2137').school === '/2137/');
console.assert(paths.tri('2137').room.list === '/2137/room/');
console.assert(paths.tri('2137').unitType('teacher').id('m.chodacka') === '/2137/teacher/m.chodacka');
console.assert(paths.tri('2137').class.id('3e') === '/2137/class/3e');
