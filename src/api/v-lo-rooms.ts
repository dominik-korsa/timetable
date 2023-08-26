import vLoRoomsRaw from 'assets/v-lo-rooms.json';

interface BaseRoom {
  id: string;
  raw: string;
  short?: string;
  full: string;
  type: 'classroom';
}

interface Entrance {
  x: number;
  y: number;
  rotation: number;
}

export const floors = ['dungeons', 'groundFloor', 'firstFloor', 'secondFloor'] as const;
export type FloorType = typeof floors[number];
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

type FloorRoom = (FloorRectRoom | FloorPathRoom) & {
  entrances?: Entrance[];
};

interface OtherRoom extends BaseRoom {
  short: string;
}

type FullFloorRoom = (FloorRoom & { location: FloorType; entrances: Entrance[]; });
type FullOtherRoom = (OtherRoom & { location: OtherLocation });

type Room = FullFloorRoom | FullOtherRoom;

export const floorRooms = vLoRoomsRaw.floors as Record<FloorType, FloorRoom[]>;
export const otherRooms = vLoRoomsRaw.other as Record<OtherLocation, OtherRoom[]>;

export const isFloor = (x: RoomLocation): x is FloorType => x in floorRooms;

export const roomRawToIdMap: Record<string, string> = {};
export const vLoRooms: Room[] = [];
export const otherRoomList: FullOtherRoom[] = [];

Object.entries(floorRooms).forEach(([floor, rooms]) => rooms.forEach((room) => {
  roomRawToIdMap[room.raw] = room.id;
  vLoRooms.push({
    ...room,
    entrances: room.entrances ?? [],
    location: floor as FloorType,
  });
}));
Object.entries(otherRooms).forEach(([location, rooms]) => rooms.forEach((room) => {
  roomRawToIdMap[room.raw] = room.id;
  const full = {
    ...room,
    location: location as OtherLocation,
  };
  vLoRooms.push(full);
  otherRoomList.push(full);
}));

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
