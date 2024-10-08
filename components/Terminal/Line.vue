<script setup lang="ts">
  import { type TLine } from '@/core/types.ts';

  const props = defineProps<{ line: TLine; editable?: boolean }>();
</script>

<template>
  <p>
    <TerminalWord v-for="(word, index) in props.line" :key="index" :word="word" />
  </p>
</template>
