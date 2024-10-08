<script setup lang="ts">
  const historyCommands: Ref<TContent> = ref([]);
  const previousLines: Ref<TContent> = ref([]);
  const currentLine = ref('');
  const curCommandIndex = ref(0);
  const commandCount = computed(() => historyCommands.value.length + 1);

  const editableLine = ref(null);

  function onClick () {
    const selection = window.getSelection();
    if (selection?.type !== 'Range') editableLine.value.root.focus();
  }

  async function onSubmit (line: TLine) {
    currentLine.value = '';
    if (line.length > 1 || line[0].content.trim()) historyCommands.value.push(line);
    previousLines.value.push(line);
    const executeResult = await execute(...line.map(({ content }) => content));
    previousLines.value.push(...executeResult);
    curCommandIndex.value = commandCount.value - 1;
    await nextTick();
    editableLine.value.updateCursor();
  }

  function onScroll () {
    editableLine.value.updateCursor();
  }

  function onUpdateContent (newContent: string) {
    currentLine.value = newContent;
  }

  function onLineUp () {
    if (curCommandIndex.value <= 0) return;
    curCommandIndex.value -= 1;
    currentLine.value = historyCommands.value[curCommandIndex.value].map(({ content }) => content).join('');
  }

  function onLineDown () { 
    if (curCommandIndex.value > commandCount.value - 2) return;
    curCommandIndex.value += 1;
    if (curCommandIndex.value === commandCount.value - 2) {
      currentLine.value = '';
    } else {
      currentLine.value = historyCommands.value[curCommandIndex.value].map(({ content }) => content).join('');
    }
  }

  onMounted(async () => {
  });
</script>

<template>
  <div
    class="pl-2 caret-transparent h-[85vh] overflow-auto"
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
