<template>
  <div class="build-info text-caption text-center">
    <template v-if="config.superSecretSettingsEnabled">
      <router-link to="/super-secret-settings">
        Super Secret Settings
      </router-link>
      <br>
    </template>

    <q-icon
      name="favorite"
      class="q-mr-xs"
      color="red"
    />
    <a href="https://github.com/cloud11665/vlo.rocks-api">API planu V LO</a>
    by <a href="https://github.com/cloud11665">cloud11665</a><br>

    <a href="https://github.com/dominik-korsa/timetable">Kod źródłowy aplikacji na GitHub</a><br>

    <span
      class="build-time"
      role="button"
      @click.prevent="buildTimeClick"
    >
      Zbudowano: <b>{{ buildTimeString }}</b><br>
    </span>
    <template v-if="buildInfo !== null">
      Deploy ID: <b><a
        :href="`https://app.netlify.com/sites/${buildInfo.siteName}/deploys/${buildInfo.deployId}`"
      >{{ buildInfo.deployId }}</a></b><br>
      Commit: <b>{{ buildInfo.branch }}@<a
        :href="`${buildInfo.repositoryUrl}/commit/${buildInfo.commitRef}`"
      >{{ buildInfo.commitRef.substring(0, 7) }}</a></b><br>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
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
      },
    };
  },
});
</script>

<style lang="scss">
.build-info {
  line-height: 2;

  .build-time {
    user-select: none;
    cursor: text;
  }

  a {
    color: $primary;
  }
}
</style>
