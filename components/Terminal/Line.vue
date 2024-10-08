<script setup lang="ts">
  import { type TLine } from '@/core/types.ts';

  const props = defineProps<{ line: TLine }>();
</script>

<template>
  <p>
    <TerminalWord v-for="(index, word) in props.line" :key="index" :word="{ word }" />
  </p>
</template>
