<script setup lang="ts">
  const previousLines: Ref<TContent> = ref([]);
  const currentLine = ref('');
  const curLineIndex = ref(0);
  const lineCount = computed(() => previousLines.value.length + 1);

  const editableLine = ref(null);

  function onClick () {
    const selection = window.getSelection();
    if (selection?.type !== 'Range') editableLine.value.root.focus();
  }

  function onSubmit (line: TLine) {
    currentLine.value = '';
    previousLines.value.push(line);
    curLineIndex.value = lineCount.value - 1;
  }

  function onScroll () {
    editableLine.value.updateCursor();
  }

  function onUpdateContent (newContent: string) {
    currentLine.value = newContent;
  }

  function onLineUp () {
    if (curLineIndex.value <= 0) return;
    curLineIndex.value -= 1;
    currentLine.value = previousLines.value[curLineIndex.value].map(({ content }) => content).join('');
  }

  function onLineDown () {
    if (curLineIndex.value >= lineCount.value - 2) return;
    curLineIndex.value += 1;
    currentLine.value = previousLines.value[curLineIndex.value].map(({ content }) => content).join('');
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
      @line-up="onLineUp"
      @line-down="onLineDown"
    />
  </div>
</template>
