import vLoRoomsRaw from 'assets/v-lo-rooms.json';

interface BaseRoom {
  id: string;
  short: string;
  full: string;
  type: string;
}

export type FloorType = 'dungeons' | 'groundFloor' | 'firstFloor' | 'secondFloor';
export type OtherType = 'institute' | 'dh' | 'uj';
export type RoomType = FloorType | OtherType;

interface FloorRoom extends BaseRoom {
  x: number;
  y: number;
  width: number;
  height: number;
  type: FloorType;
  vertical?: boolean;
}

interface OtherRoom extends BaseRoom {
  type: OtherType;
}

type Room = FloorRoom | OtherRoom;

export const vLoRooms = vLoRoomsRaw as Room[];

export const floorRooms: Record<FloorType, FloorRoom[]> = {
  firstFloor: [],
  secondFloor: [],
  groundFloor: [],
  dungeons: [],
};
export const otherRooms: OtherRoom[] = [];

export const isFloorRoom = (room: BaseRoom): room is FloorRoom => room.type in floorRooms;

vLoRooms.forEach((room) => {
  if (isFloorRoom(room)) floorRooms[room.type].push(room);
  else otherRooms.push(room);
});

export const typeDescription: Record<RoomType, string> = {
  dungeons: 'V LO, piwnice',
  groundFloor: 'V LO, parter',
  firstFloor: 'V LO, 1. piętro',
  secondFloor: 'V LO, 2. piętro',
  uj: 'Kampus UJ',
  dh: 'Dom Harcerza',
  institute: 'Instytut Austriacki',
};
