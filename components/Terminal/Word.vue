<script setup lang="ts">
  import { type TWord } from '@/core/types.ts';

  const props = defineProps<{ word: TWord; editable?: boolean }>();

  const emits = defineEmits<{
    input: [word: string];
  }>();

  async function onInput (e: InputEvent) {
    await emits('input', (e.target as any).innerText);
    (e.target as any).innerText = props.word.content;
  }
</script>

<template>
  <span
    v-if="props.editable || false"
    :class="`text-${props.word.color} outline-none`"
    contenteditable
    @input="onInput"
  >
    {{ props.word.content }}
  </span>
  <span
    v-else
    :class="`text-${props.word.color}`"
    contenteditable
  >
    {{ props.word.content }}
  </span>
</template>
