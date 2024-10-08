<script setup lang="ts">
  import { type TWord } from '@/core/types.ts';

  const props = defineProps<{ word: TWord }>();
</script>

<template>
  <span :class="`text-${props.word.color}`">
    {{ props.word.content }}
  </span>
</template>
