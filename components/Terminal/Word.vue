<script setup lang="ts">
  import { type TWord } from '@/core/types.ts';

  const props = defineProps<{ word: TWord; editable?: boolean }>();
</script>

<template>
  <span :class="`text-${props.word.color}`" :contenteditable="props.editable || false">
    {{ props.word.content }}
  </span>
</template>
