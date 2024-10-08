<script setup lang="ts">
  import { type TLine, TColor } from '@/core/types';

  const props = defineProps<{ line: TLine; editable?: boolean }>();
</script>

<template>
  <p role="text" class="flex justify-start gap-0">
    <TerminalWord v-for="(word, index) in props.line" :key="index" :word="word" :editable="props.editable || false" />
    <TerminalWord class="flex-1" :word="{ content: '', color: TColor.WHITE }" :editable="props.editable || false" />
  </p>
</template>
