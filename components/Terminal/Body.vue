<script setup lang="ts">
  const previousLines: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const lineCount = computed(() => previousLines.value.length + 1);

  const editableLine = ref(null);

  function onClick () {
    const selection = window.getSelection();
    if (selection?.type !== 'Range') editableLine.value.root.focus();
  }

  function onSubmit (line: TLine) {
    currentLine.value = '';
    previousLines.value.push(line);
  }

  function onScroll () {
    editableLine.value.updateCursor();
  }

  function onUpdateContent (newContent: string) {
    currentLine.value = newContent;
  }
</script>

<template>
  <div
    class="pl-2 caret-transparent h-[88vh] overflow-auto"
    @click="onClick"
    @scroll="onScroll"
  > 
    <TerminalLine
      v-for="(line, index) in previousLines"
      :key="index"
      :line="line"
      ref="nonEditableLines"
    />
    <TerminalEditableLine
      :content="currentLine"
      ref="editableLine"
      @submit="onSubmit"
      @update-content="onUpdateContent"
    />
  </div>
</template>
