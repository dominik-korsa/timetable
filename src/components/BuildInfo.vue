<template>
  <div class="build-info text-caption text-center">
    <p v-if="config.superSecretSettingsEnabled">
      <router-link to="/super-secret-settings">
        Super Secret Settings
      </router-link>
    </p>

    <p>
      <q-icon
        name="favorite"
        class="q-mr-xs"
        color="red"
      />
      <a href="https://github.com/cloud11665/vlott">API planu V LO</a>
      by <a href="https://github.com/cloud11665">cloud11665</a>
    </p>

    <p>
      <a
        href="https://github.com/dominik-korsa/timetable"
        @click="onSourceCodeLinkClick"
      >Kod źródłowy aplikacji na GitHub</a>
    </p>

    <p>
      <i>OPTIVUM</i> jest zastrzeżonym znakiem<br>
      handlowym firmy <i>VULCAN sp. z o.o.</i>
    </p>

    <p
      class="build-time"
      role="button"
      @click.prevent="buildTimeClick"
    >
      Zbudowano: <b>{{ buildTimeString }}</b>
    </p>

    <template v-if="buildInfo !== null">
      <p>
        Deploy ID: <b><a
          :href="`https://app.netlify.com/sites/${buildInfo.siteName}/deploys/${buildInfo.deployId}`"
        >{{ buildInfo.deployId }}</a></b>
      </p>
      <p>
        Commit: <b>{{ buildInfo.branch }}@<a
          :href="`${buildInfo.repositoryUrl}/commit/${buildInfo.commitRef}`"
        >{{ buildInfo.commitRef.substring(0, 7) }}</a></b>
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { typed } from 'src/utils';
import { useConfigStore } from 'stores/config';
import { useQuasar } from 'quasar';
import { Temporal } from '@js-temporal/polyfill';

interface NetlifyBuildInfo {
  deployId: string,
  branch: string,
  repositoryUrl: string,
  commitRef: string,
  siteName: string,
}

export default defineComponent({
  name: 'BuildInfo',
  setup: () => {
    const config = useConfigStore();
    const quasar = useQuasar();

    const buildTime = Temporal.Instant.from(process.env.BUILD_TIME as string);
    let buildTimeClickCount = 0;

    const justUnlocked = ref(false);

    return {
      config,
      buildTimeString: computed(() => buildTime.toLocaleString()),
      buildInfo: process.env.DEPLOY_ID === undefined ? null : typed<NetlifyBuildInfo>({
        deployId: process.env.DEPLOY_ID,
        commitRef: process.env.COMMIT_REF as string,
        repositoryUrl: process.env.REPOSITORY_URL as string,
        siteName: process.env.SITE_NAME as string,
        branch: process.env.BRANCH as string,
      }),
      buildTimeClick: () => {
        if (config.superSecretSettingsEnabled) return;
        buildTimeClickCount += 1;
        if (buildTimeClickCount < 5) return;
        config.setSuperSecretSettings(true);
        quasar.notify({
          message: 'Włączono Super Secret Settings',
        });
        justUnlocked.value = true;
        setTimeout(() => {
          justUnlocked.value = false;
        }, 1000);
      },
      onSourceCodeLinkClick: (event: MouseEvent) => {
        if (justUnlocked.value)event.preventDefault();
      },
    };
  },
});
</script>

<style lang="scss">
.build-info {
  line-height: 1.2;

  p {
    margin-bottom: 0.75em;
  }

  p:last-of-type {
    margin-bottom: 0;
  }

  .build-time {
    user-select: none;
    cursor: text;
  }
}
</style>
