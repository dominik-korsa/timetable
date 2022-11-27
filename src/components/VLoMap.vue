<template>
  <svg
    width="100%"
    :viewBox="viewboxValue"
    class="v-lo-map"
  >
    <text
      v-if="!campaign"
      x="152"
      y="112"
      class="v-lo-map__floor-number"
      text-anchor="middle"
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
    <path
      v-if="floor === 'dungeons'"
      class="v-lo-map__corridor"
      d="m 240,112 0,80 H 96 V 80 H 80 V 208 H 256 V 112 Z"
    />
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
        d="M 240,48 V 192 H 96 v -48 H 80 v 48 H 48 16 v 16 H 48 80 128 v 40 h 48 v -40 h 80 V 48 Z"
      />
    </template>
    <path
      v-else-if="floor === 'firstFloor'"
      class="v-lo-map__corridor"
      d="M 80,48 V 192 H 48 v 16 16 h 16 v -16 H 80 256 V 48 h -16 V 192 H 96 V 48 Z"
    />
    <path
      v-else-if="floor === 'secondFloor'"
      class="v-lo-map__corridor"
      d="M 80,48 V 192 H 48 v 16 H 80 256 V 48 h -16 V 192 H 96 V 48 Z"
    />
    <g
      v-for="room in rooms"
      :key="room.id"
      role="button"
      tabindex="0"
      class="v-lo-map__room"
      :class="{
        'v-lo-map__room--vertical': !!room.vertical,
        'v-lo-map__room--selected': room.id === selectedId,
      }"
      @click="onRoomClick(room.id)"
      @keydown.enter="onRoomClick(room.id)"
      @keydown.space="onRoomClick(room.id)"
    >
      <rect
        :width="room.width*8"
        :height="room.height*8"
        :x="room.x*8"
        :y="room.y*8"
      />
      <foreignObject
        :width="room.width*8"
        :height="room.height*8"
        :x="room.x*8"
        :y="room.y*8"
      >
        <div class="v-lo-map__room-text">
          <div>
            {{ room.short }}
          </div>
        </div>
      </foreignObject>
    </g>

    <g v-if="campaign">
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
          <a href="https://plan.dk-gl.eu/">plan.dk-gl.eu</a>
        </div>
      </foreignObject>
    </g>
  </svg>
</template>

<script lang="ts">
import { floorRooms, FloorType } from 'src/api/v-lo-rooms';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    floor: {
      type: String as PropType<FloorType>,
      required: true,
    },
    viewbox: {
      type: String as PropType<'default' | 'reduced-height' | 'centered'>,
      required: false,
      default: 'default',
    },
    campaign: Boolean,
    selectedId: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  emits: ['roomClick'],
  setup: (props, { emit }) => ({
    rooms: computed(() => floorRooms[props.floor]),
    floorNumber: computed(() => ({
      dungeons: '-1',
      groundFloor: '0',
      firstFloor: '+1',
      secondFloor: '+2',
    }[props.floor])),
    viewboxValue: computed(() => ({
      default: '-4 -36 296 288',
      'reduced-height': '-4 12 296 242',
      centered: '-4 -36 312 288',
    }[props.viewbox])),
    onRoomClick: (id: string) => {
      emit('roomClick', id);
    },
  }),
});
</script>

<style lang="scss">
.v-lo-map {
  max-height: 100%;
  max-width: 100%;

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
    fill: #ddd;
    stroke-width: 1px;
    stroke: black;
  }

  .v-lo-map__room {
    cursor: pointer;
    user-select: none;
    outline: none;

    &.v-lo-map__room--selected rect, &:hover rect {
      fill: lighten($primary, 15%);
    }

    &.v-lo-map__room--selected rect {
      animation: selected-rect ease-in-out alternate infinite 800ms;

      @keyframes selected-rect {
        to {
          fill: lighten($primary, 30%);
        }
      }
    }

    &:focus-visible {
      outline: 2px solid black;
      outline-offset: 2px;
    }

    rect {
      fill: $primary;
      stroke-width: 1px;
      stroke: black;
      transition: fill 200ms, fill-opactiy 200ms;
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
      color: $primary;
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
