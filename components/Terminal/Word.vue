<script setup lang="ts">
  const props = defineProps<{ word: TWord }>();
</script>

<template>
  <span
    role="text"
    :class="`text-${props.word.color} bg-black p-0 m-0`"
  >
    {{ props.word.content }}
  </span>
</template>
