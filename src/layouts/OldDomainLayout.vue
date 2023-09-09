<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container
      id="container"
      class="bg-primary fullscreen text-white text-center overflow-hidden column"
    >
      <div
        id="title"
        class="column justify-center q-px-sm"
      >
        <h1 class="q-ma-none">
          Nowy rok<span class="toned-down-text">*</span><br>
          nowa domena
        </h1>
        <div
          id="links"
          class="q-px-sm column justify-center"
        >
          <span
            id="old-host"
            class="text-weight-thin"
          >{{ oldHost }}</span>
          <span
            id="is-now"
            class="text-weight-thin"
          >to teraz</span>
          <a
            id="new-host"
            class="text-weight-light"
            :href="newHostLink"
          >{{ newHost }}</a>
        </div>
      </div>
      <q-banner
        id="standalone-banner"
        rounded
        class="standalone text-black bg-warning self-center shadow-4 q-mx-sm"
      >
        Będziesz musiał ponownie dodać stronę do ekranu głównego
      </q-banner>
      <div
        id="footer"
        class="toned-down-text q-pa-md"
      >
        *rok szkolny <b>2022/2023</b>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const newHost = process.env.NEW_HOST;
const oldHost = process.env.OLD_HOST;
const newHostLink = computed(() => `https://${newHost}${route.fullPath}`);
</script>

<style lang="scss">
#container {
  font-size: min(13vw, calc((1vh - 1px) * 15), 56pt);
}

#title {
  flex-grow: 1;
  flex-basis: 0;
  h1 {
    font-size: 1em;
    line-height: 1.2;
  }
}

#links {
  line-height: 1.2;
  animation: links 1.5s 3s ease-in-out backwards;
  height: 2.5em;
  flex-wrap: nowrap;
  font-size: min(7vw, 5vh, 20pt);
  margin-top: 3em;

  #old-host {
    font-size: 1em;
  }

  #is-now {
    font-size: 0.8em;
    margin: 0.5em 0;
  }

  #new-host {
    font-size: 1.8em;
    text-decoration: none;
    color: #eee;
    align-self: center;
    position: relative;
    outline: none;

    &::before {
      content: '';
      background-color: #fff4;
      position: absolute;
      left: 0;
      bottom: 0.05em;
      width: 100%;
      height: 8px;
      z-index: -1;
      transition: all .3s ease-in-out;
    }

    &:hover::before, &:focus-visible::before {
      bottom: 0;
      height: 100%;
      width: calc(100% + 16px);
      margin-left: -8px;
      margin-right: -8px;
      border-radius: 4px;
    }

    &:focus-visible::before {
      outline: 2px solid white;
      outline-offset: 4px;
    }
  }
}

#standalone-banner {
  animation: banner 1s 5s ease-in backwards;

  @keyframes banner {
    from {
      opacity: 0;
    }
  }
}

#footer {
  font-size: min(12pt, 4vh, 6vw);
}

.toned-down-text {
  opacity: 30%;
}

@keyframes links {
  from {
    height: 0;
    transform: scale(0);
  }
}
</style>
