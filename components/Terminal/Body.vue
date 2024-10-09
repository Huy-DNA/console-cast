<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const cursorPosition: Ref<TCursorPosition> = ref({ line: 0, offset: 0 });
</script>

<template>
  <div class="pl-2">
    <TerminalLine v-for="(line, index) in content" :key="index" :line="line" />
    <TerminalEditableLine :content="currentLine" />
  </div>
</template>
