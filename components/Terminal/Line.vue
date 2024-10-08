<script setup lang="ts">
  import { type TLine } from '@/core/types';

  const props = defineProps<{ line: TLine; editable?: boolean }>();
</script>

<template>
  <p
    role="text"
    class="focus:outline-none"
    :contenteditable="props.editable || false"
  >
    <TerminalWord v-for="(word, index) in props.line" :key="index" :word="word" :editable="props.editable || false" />
  </p>
</template>
