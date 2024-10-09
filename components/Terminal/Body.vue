<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const cursorPosition: Ref<TCursorPosition> = ref({ line: 0, offset: 0 });
  const nonEditableLines = ref(null);
  const editableLine = ref(null);
  
  const lineCount = computed(() => content.value.length + 1);
  const lineNodes = computed(() => [...(nonEditableLines.value || []), editableLine.value]);
</script>

<template>
  <div class="pl-2 caret-transparent">
    <TerminalLine v-for="(line, index) in content" :key="index" :line="line" ref="nonEditableLines" />
    <TerminalEditableLine :content="currentLine" ref="editableLine" />
  </div>
</template>
