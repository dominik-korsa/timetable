<template>
  <q-btn
    flat
    round
    icon="arrow_back"
    :aria-label="ariaLabel"
    :to="props.to"
    @click="onBack"
  />
</template>

<script lang="ts" setup>
import { Path } from 'src/router/path-builder';
import { useRouter } from 'vue-router';

const props = defineProps<{
  to: Path;
  ariaLabel: string;
}>();

const router = useRouter();

const onBack = (event: MouseEvent) => {
  const resolved = router.resolve(props.to);
  if (resolved.href !== window.history.state.back) return;
  event.preventDefault();
  router.back();
};
</script>
