import vLoRoomsRaw from 'assets/v-lo-rooms.json';

interface BaseRoom {
  id: string;
  raw: string;
  short?: string;
  full: string;
  type: 'classroom';
}

export type FloorType = 'dungeons' | 'groundFloor' | 'firstFloor' | 'secondFloor';
export type OtherLocation = 'institute' | 'dh' | 'uj';
export type RoomLocation = FloorType | OtherLocation;

interface FloorRectRoom extends BaseRoom {
  x: number;
  y: number;
  width: number;
  height: number;
  vertical?: boolean;
}

interface FloorPathRoom extends BaseRoom {
  d: string;
}

type FloorRoom = FloorRectRoom | FloorPathRoom;

interface OtherRoom extends BaseRoom {
  location: OtherLocation;
  short: string;
}

type Room = (FloorRoom & { location: FloorType }) | OtherRoom;

export const floorRooms: Record<FloorType, FloorRoom[]> = vLoRoomsRaw.floors as Record<FloorType, FloorRoom[]>;
export const otherRooms: OtherRoom[] = vLoRoomsRaw.other as OtherRoom[];

export const isFloor = (x: RoomLocation): x is FloorType => x in floorRooms;

export const roomRawToIdMap: Record<string, string> = {};
export const vLoRooms: Room[] = [];

Object.entries(floorRooms).forEach(([floor, rooms]) => rooms.forEach((room) => {
  roomRawToIdMap[room.raw] = room.id;
  vLoRooms.push({
    ...room,
    location: floor as FloorType,
  });
}));
otherRooms.forEach((room) => {
  roomRawToIdMap[room.raw] = room.id;
  vLoRooms.push(room);
});

export const floorNames: Record<FloorType, string> = {
  dungeons: 'piwnice',
  groundFloor: 'parter',
  firstFloor: '1. piętro',
  secondFloor: '2. piętro',
};

export const locationDescription: Record<RoomLocation, string> = {
  dungeons: 'V LO, piwnice',
  groundFloor: 'V LO, parter',
  firstFloor: 'V LO, 1. piętro',
  secondFloor: 'V LO, 2. piętro',
  uj: 'Kampus UJ',
  dh: 'Dom Harcerza',
  institute: 'Instytut Austriacki',
};
