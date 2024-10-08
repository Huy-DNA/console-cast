<script setup lang="ts">
  import { type TLine, TColor } from '@/core/types';

  const props = defineProps<{ line: TLine; editable?: boolean }>();
  const wordCount = computed(() => props.line.length);

  const emits = defineEmits<{
    input: [{ word: string, index: number }],
  }>();
</script>

<template>
  <p role="text" class="flex justify-start gap-0">
    <TerminalWord
      v-for="(word, index) in props.line"
      :key="index"
      :word="word"
      :editable="props.editable || false"
      @input="(word) => emits('input', { word, index })"
    />
    <TerminalWord
      v-if="props.editable || false"
      class="flex-1"
      :word="{ content: '', color: TColor.WHITE }"
      editable
      @input="(word) => emits('input', { word, index: wordCount })"
    />
  </p>
</template>
