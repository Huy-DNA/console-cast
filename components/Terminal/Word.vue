<script setup lang="ts">
  import { type TWord } from '@/core/types.ts';

  const props = defineProps<{ word: TWord; editable?: boolean }>();

  const emits = defineEmits<{
    input: [word: string];
  }>();

  const inputRef = useTemplateRef('input');

  function onInput (e: InputEvent) {
    emits('input', (e.target as any).innerText);
    (e.target as any).innerText = '';
  }
</script>

<template>
  <span
    v-if="props.editable || false"
    :class="`text-${props.word.color} outline-none`"
    contenteditable
    ref="input"
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
