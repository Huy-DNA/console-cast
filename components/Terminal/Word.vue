<script setup lang="ts">
  import { ColoredWord } from '~/lib';

  const props = defineProps<{ word: ColoredWord }>();
</script>

<template>
  <span
    role="text"
    :class="`text-${props.word.color} bg-black p-0 m-0`"
  >
    {{ props.word.content }}
  </span>
</template>
