<template>
  <div class="text-caption text-center">
    <q-icon
      name="favorite"
      class="q-mr-xs"
      color="red"
    />
    <a href="https://github.com/cloud11665/vlo.rocks-api">API planu V LO</a>
    by <a href="https://github.com/cloud11665">cloud11665</a><br>

    <a href="https://github.com/dominik-korsa/timetable">Kod źródłowy aplikacji na GitHub</a><br>

    Zbudowano: <b>{{ buildTimeString }}</b><br>
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
    const buildTime = new Date(process.env.BUILD_TIME as string);
    return ({
      buildTimeString: computed(() => buildTime.toLocaleString()),
      buildInfo: process.env.DEPLOY_ID === undefined ? null : typed<NetlifyBuildInfo>({
        deployId: process.env.DEPLOY_ID,
        commitRef: process.env.COMMIT_REF as string,
        repositoryUrl: process.env.REPOSITORY_URL as string,
        siteName: process.env.SITE_NAME as string,
        branch: process.env.BRANCH as string,
      }),
    });
  },
});
</script>
