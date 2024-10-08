<script setup lang="ts">
  import { type TWord } from '@/core/types.ts';

  const props = defineProps<{ word: TWord; editable?: boolean }>();

  const emits = defineEmits<{
    input: [word: string];
  }>();

  function onInput (e: InputEvent) {
    emits('input', (e.target as any).innerText);
    (e.target as any).innerText = '';
  }
</script>

<template>
  <span :class="`text-${props.word.color} outline-none`" :contenteditable="props.editable || false" @input="onInput">
    {{ props.word.content }}
  </span>
</template>
