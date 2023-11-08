<template>
  <svg
    width="100%"
    :viewBox="viewboxValue"
    class="v-lo-map"
  >
    <text
      v-if="!noText && !campaign13c"
      x="152"
      y="112"
      class="v-lo-map__floor-number"
      text-anchor="middle"
      :aria-label="floorName"
    >
      {{ floorNumber }}
    </text>
    <path
      class="v-lo-map__bg"
      d="m 48,16 0,176 H 16 l 0,48 h 96 v 8 L 192,248 v -8 h 96 V 192 H 256 V 16 H 208 V 192
      H 176 v -32 h -48 v 32 H 96 V 176 H 112 V 160 H 96 L 96,16 Z"
    />
    <rect
      class="v-lo-map__bg-stairs"
      width="32"
      height="16"
      x="48"
      y="80"
    />
    <rect
      class="v-lo-map__bg-stairs"
      width="48"
      height="32"
      x="128"
      y="160"
    />
    <template v-if="floor === 'dungeons'">
      <path
        class="v-lo-map__corridor"
        d="m 240,112 0,80 H 96 V 80 H 80 V 208 H 256 V 112 Z"
      />
      <path
        class="v-lo-map__corridor-outline"
        d="m 240,112 0,80 H 96 V 80 H 80 V 208 H 256 V 112 Z"
      />
    </template>
    <template v-else-if="floor === 'groundFloor'">
      <rect
        class="v-lo-map__corridor"
        width="16"
        height="80"
        x="80"
        y="32"
      />
      <path
        class="v-lo-map__corridor"
        d="M 240,32 V 192 H 96 v -48 H 80 v 48 H 16 v 16 H 112 v 20 h 8 l 8,-8 v 28 H 176 v -40 H 256 V 32 Z"
      />
      <rect
        class="v-lo-map__corridor-outline"
        width="16"
        height="80"
        x="80"
        y="32"
      />
      <path
        class="v-lo-map__corridor-outline"
        d="M 240,32 V 192 H 96 v -48 H 80 v 48 H 16 v 16 H 112 v 20 h 8 l 8,-8 v 28 H 176 v -40 H 256 V 32 Z"
      />
      <path
        class="v-lo-map__corridor-outline"
        d="M 112 208 h 4 m 8,0 h 4 v 12"
      />
    </template>
    <template v-else-if="floor === 'firstFloor'">
      <path
        class="v-lo-map__corridor"
        d="M 80,48 V 192 H 48 v 30 h 16 V 208 H 256 V 48 h -16 V 192 H 96 V 48 Z"
      />
      <path
        class="v-lo-map__corridor-outline"
        d="M 80,48 V 192 H 48 v 30 h 16 V 208 H 256 V 48 h -16 V 192 H 96 V 48 Z"
      />
    </template>
    <template v-else-if="floor === 'secondFloor'">
      <path
        class="v-lo-map__corridor"
        d="M 80,48 V 192 H 48 v 16 H 256 V 32 h -16 V 192 H 96 V 48 Z"
      />
      <path
        class="v-lo-map__corridor-outline"
        d="M 80,48 V 192 H 48 v 16 H 256 V 32 h -16 V 192 H 96 V 48 Z"
      />
    </template>
    <g
      v-for="room in rooms"
      :key="room.id"
      role="button"
      tabindex="0"
      class="v-lo-map__room"
      :class="{
        [`v-lo-map__room--${room.type}`]: true,
        'v-lo-map__room--vertical': !!room.vertical,
        'v-lo-map__room--selected': room.id === selectedId,
        'v-lo-map__room--checkpoint': room.id === 'kontrola-graniczna'
      }"
      :aria-label="room.full"
      @click="onRoomClick(room.id)"
      @keydown.enter="onRoomClick(room.id)"
      @keydown.space="onRoomClick(room.id)"
    >
      <rect
        v-if="room.width !== undefined"
        class="v-lo-map__room-shape"
        :width="room.width*8"
        :height="room.height*8"
        :x="room.x*8"
        :y="room.y*8"
      />
      <path
        v-else
        class="v-lo-map__room-shape"
        :d="room.d"
      />
      <foreignObject
        v-if="!noText && room.short"
        :width="room.width*8"
        :height="room.height*8"
        :x="room.x*8"
        :y="room.y*8"
      >
        <div
          class="v-lo-map__room-text"
          aria-hidden="true"
        >
          <div>
            {{ room.short }}
          </div>
        </div>
      </foreignObject>
      <template v-if="room.id === 'kontrola-graniczna'">
        <path d="M 128,216 h 6 v 1 l -6 6 Z" />
        <path d="M 128,227 l 6 -6 v 6 l -6 6 Z" />
        <path d="M 128,237 l 6 -6 v 6 l -6 6 Z" />
        <path d="M 128,247 l 6 -6 v 7 h -6 Z" />

        <path d="M 170,216 h 6 v 1 l -6 6 Z" />
        <path d="M 170,227 l 6 -6 v 6 l -6 6 Z" />
        <path d="M 170,237 l 6 -6 v 6 l -6 6 Z" />
        <path d="M 170,247 l 6 -6 v 7 h -6 Z" />

        <g transform="translate(142, 222) scale(0.05)">
          <path
            d="M 300 49 L 217 49 L 207 49 L 182 74 L 207 74 L 207 79 C 207 107 230 130 258 130 C 287 130 310 107 310 79 L 310 49 L 300 49 Z M 310 33 L 205 33 L 182 0 L 310 0 Z M 349 148 L 348 148 L 344 148 L 215 312 L 320 312 L 320 340 L 188 340 L 188 396 L 320 396 L 376 396 L 376 340 L 376 312 L 376 209 L 376 176 C 376 161 364 148 349 148 Z M 3 17 L 3 53 L 3 84 L 3 121 L 7 124 C 26 138 44 152 63 167 C 64 167 65 168 66 169 C 66 169 66 169 67 169 L 67 133 L 67 124 L 89 124 L 89 17 L 3 17 Z M 83 118 L 67 118 L 67 102 L 67 65 C 48 51 29 37 10 22 L 83 22 L 83 118 Z M 304 148 L 181 148 L 170 148 L 170 148 C 164 148 158 150 154 155 C 139 174 124 193 108 212 C 86 195 63 178 41 161 C 30 153 13 159 7 170 C 0 182 6 195 16 203 C 43 223 70 244 97 264 C 98 265 98 266 99 266 C 100 266 100 267 100 267 C 105 270 111 271 117 270 C 122 269 127 267 130 263 C 130 263 130 263 130 262 C 131 261 132 260 133 259 C 149 239 165 218 181 198 L 181 302 L 304 148 Z"
            fill="#000"
            stroke="none"
          />
        </g>
      </template>
    </g>
    <g
      v-for="entrance in selectedRoomEntrances"
      :key="entrance.id"
      :transform="`translate(${entrance.x * 8}, ${entrance.y * 8})`"
      class="v-lo-map__entrance"
      aria-hidden="true"
    >
      <g :transform="`rotate(${entrance.rotation})`">
        <!--        <path-->
        <!--          class="v-lo-map__entrance-door"-->
        <!--          d="M -4,0 h 8"-->
        <!--          stroke="red"-->
        <!--          stroke-width="2"-->
        <!--        />-->
        <path
          class="v-lo-map__entrance-arrow-back"
          d="M -4,8 l 4,-6 l 4,6"
        />
        <path
          class="v-lo-map__entrance-arrow"
          d="M -4,8 l 4,-6 l 4,6"
        />
      </g>
    </g>

    <g v-if="campaign13c">
      <path
        style="fill:none;stroke:#ff0000;stroke-width:2"
        d="m 78.657787,40.056685 c 13.30387,8.829199 16.675382,27.364736
        7.830441,40.533505 -9.2387,13.755018 -28.481397,17.223024 -42.128574,7.981606
        -14.155674,-9.585754 -17.710966,-29.446171 -8.129529,-43.51196 9.888481,-14.516538
        30.298889,-18.151619 44.73823,-8.271477 0.81723,0.559191 1.608914,1.155699 2.371811,1.787003"
        transform="matrix(0.68771907,0,0,0.62448941,22.350785,24.643964)"
      />
      <path
        style="stroke:#ff0000;stroke-width:1;fill:none;"
        d="m 123.31526,39.913998 c 0,0 -25.278331,-8.833213 -45.50057,4.780752"
      />
      <path
        style="fill:none;stroke:#ff0000;stroke-width:1;"
        d="m 80.371646,38.946419 -2.556956,5.748331 6.549475,0.246106"
      />
      <text
        class="v-lo-map__13-campaign-title"
        x="152"
        y="48"
      >
        Tu jest.
      </text>
      <foreignObject
        x="104"
        y="60"
        width="96"
        height="96"
        class="v-lo-map__13-campaign-text"
        text-anchor="middle"
      >
        <div>
          <div>
            Sprawdź gdzie jest twoja sala bezpośrednio w planie lekcji!
          </div>
          <a href="/">plan.dk-gl.eu</a>
        </div>
      </foreignObject>
    </g>
  </svg>
</template>

<script lang="ts" setup>
import {
  floorNames, floorRooms, FloorType,
} from 'src/api/v-lo-rooms';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  floor: FloorType;
  viewbox?: 'default' | 'reduced-height' | 'centered';
  campaign13c?: boolean;
  selectedId?: string | undefined;
  noText?: boolean;
}>(), {
  viewbox: 'default',
  selectedId: undefined,
});

const emit = defineEmits<{
  (e: 'room-click', roomId: string): void;
}>();

const rooms = computed(() => floorRooms[props.floor]);

const floorNumber = computed(() => ({
  dungeons: '-1',
  groundFloor: '0',
  firstFloor: '+1',
  secondFloor: '+2',
}[props.floor]));

const floorName = computed(() => floorNames[props.floor]);

const viewboxValue = computed(() => ({
  default: '-4 -36 296 288',
  'reduced-height': '-4 12 296 242',
  centered: '-4 -36 312 288',
}[props.viewbox]));

const selectedRoomEntrances = computed(() => {
  if (props.selectedId === undefined) return [];
  return rooms.value.find((room) => room.id === props.selectedId)?.entrances?.map((entrance, index) => ({
    ...entrance,
    id: `${props.selectedId}:${index}`,
  })) ?? [];
});

const onRoomClick = (id: string) => {
  emit('room-click', id);
};
</script>

<style lang="scss">
.v-lo-map {
  max-height: 100%;
  max-width: 100%;

  $corridor: #ddd;
  $selected-animation-duration: 600ms;

  .v-lo-map__bg {
    fill: #999;
    stroke-width: 1px;
    stroke: black;
  }

  .v-lo-map__bg-stairs {
    fill: #7F9183;
    stroke-width: 1px;
    stroke: black;
  }

  .v-lo-map__corridor {
    fill: $corridor;
  }

  .v-lo-map__corridor-outline {
    fill: none;
    stroke-width: 1px;
    stroke: black;
  }

  .v-lo-map__room {
    cursor: pointer;
    user-select: none;
    outline: none;

    &.v-lo-map__room--classroom {
      --base-color:  #{$primary};
      --hover-color: #{lighten($primary, 15%)};
      --blink-color: #{lighten($primary, 30%)};
    }

    &.v-lo-map__room--bathroom {
      --base-color:  #{$teal};
      --hover-color: #{$teal-4};
      --blink-color: #{$teal-3};
    }

    &.v-lo-map__room--teachers {
      --base-color:  #{$purple};
      --hover-color: #{$purple-4};
      --blink-color: #{$purple-3};
    }

    &.v-lo-map__room--management {
      --base-color:  #{$pink};
      --hover-color: #{$pink-4};
      --blink-color: #{$pink-3};
    }

    &.v-lo-map__room--facility {
      --base-color:  #{$blue-grey-7};
      --hover-color: #{$blue-grey-5};
      --blink-color: #{$blue-grey-4};
    }

    &.v-lo-map__room--other {
      --base-color:  #{$lime-7};
      --hover-color: #{$lime-4};
      --blink-color: #{$lime-2};
    }

    &.v-lo-map__room--checkpoint {
      --base-color: #{$amber};
      --hover-color: #{$amber-4};
      --blink-color: #{$amber-2};
    }

    &:hover .v-lo-map__room-shape {
      fill: var(--hover-color);
    }

    &.v-lo-map__room--selected .v-lo-map__room-shape {
      animation: selected-rect ease-in-out alternate infinite $selected-animation-duration;

      @keyframes selected-rect {
        to {
          fill: var(--blink-color);
        }
      }
    }

    &:focus-visible {
      outline: 2px solid black;
      outline-offset: 2px;
    }

    .v-lo-map__room-shape {
      fill: var(--base-color);
      stroke-width: 1px;
      stroke: black;
      transition: fill 200ms, fill-opactiy 200ms;

      //fill-opacity: 0.1;
      //stroke-dasharray: 1 1;
      //stroke: var(--base-color);
    }

    .v-lo-map__room-text {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      color: white;
    }

    &.v-lo-map__room--vertical .v-lo-map__room-text > div {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
  }

  .v-lo-map__entrance {
    pointer-events: none;
    filter: drop-shadow(0 2px 1px #0003);

    @keyframes mapEntranceArrow {
      from { transform: translateY(5px); }
      to { transform: none; }
    }

    .v-lo-map__entrance-arrow-back {
      stroke-width: 3.5px;
      stroke: $red;
    }

    .v-lo-map__entrance-arrow {
      stroke-width: 1.5px;
      stroke: white;
    }

    .v-lo-map__entrance-arrow-back, .v-lo-map__entrance-arrow {
      animation: mapEntranceArrow alternate infinite $selected-animation-duration ease-in-out;
      fill: none;
      stroke-linecap: square;
      stroke-linejoin: round;
    }
  }

  .v-lo-map__floor-number {
    font-weight: lighter;
    font-size: 4em;
  }

  .v-lo-map__13-campaign-title {
    font-weight: 900;
    font-size: 1em;
    text-align: center;
    text-anchor: middle;
    fill: #ff0000;
  }

  .v-lo-map__13-campaign-text {
    font-weight: 700;
    text-align: center;
    line-height: 1.4;
    font-size: 0.8em;

    a {
      display: block;
      margin-top: 8px;
      white-space: nowrap;
      font-size: 1.3em;
    }
  }
}

body.body--dark .v-lo-map {
  .v-lo-map__bg {
    fill: #333;
  }

  .v-lo-map__corridor {
    fill: #888;
  }

  .v-lo-map__floor-number {
    fill: #fff9;
  }
}
</style>
