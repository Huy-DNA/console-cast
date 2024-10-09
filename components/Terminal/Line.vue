<script setup lang="ts">
  const props = defineProps<{ line: TLine }>();
</script>

<template>
  <p role="text" class="flex justify-start gap-0 w-[100%]">
    <TerminalWord
      v-for="(word, index) in props.line"
      :key="index"
      :word="word"
    />
  </p>
</template>
