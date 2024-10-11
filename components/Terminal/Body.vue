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
    await printPrompt();
    editableLine.value.updateCursor();
  }

  function onScroll () {
    editableLine.value.updateCursor(false);
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
    if (curCommandIndex.value === commandCount.value - 2) {
      currentLine.value = '';
      curCommandIndex.value += 1;
    } else {
      currentLine.value = historyCommands.value[curCommandIndex.value].map(({ content }) => content).join('');
      curCommandIndex.value += 1;
    }
  }

  async function printPrompt () {
    const executeResult = await execute(TCommandName.ECHO, '┌', ' ' , '\u001b[35m~', ' ', 'as', ' ', '\u001b[34mguest');
    previousLines.value.push(...executeResult);
  }

  async function printWelcome () {
    const executeResult = [
      ...await execute(TCommandName.ECHO, ' Theme inspired by ', '\u001b[33mcatpuccin', '...'),
      ...await execute(TCommandName.ECHO, ''),
      ...await execute(TCommandName.ECHO, '\u001b[32m  ／l、', '\u001b[31m            guest@console-cast'),
      ...await execute(TCommandName.ECHO, '\u001b[32m（ﾟ､ ｡ ７' , '\u001b[34m           js',  '        Nuxt 3'),
      ...await execute(TCommandName.ECHO, '\u001b[32m  l  ~ヽ', '\u001b[34m           css', '       Tailwind'),
      ...await execute(TCommandName.ECHO, '\u001b[32m  じしf_,)ノ', '\u001b[34m        dbms', '      PostgreSQL 17 + Zapatos'),
      ...await execute(TCommandName.ECHO, '\u001b[34m                   runtime', '   bun'),
      ...await execute(TCommandName.ECHO, ''),
    ];
    previousLines.value.push(...executeResult); 
  }

  onMounted(async () => {
    await printWelcome();
    await printPrompt();
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
      :prefix="[
        { content: '└', color: TColor.WHITE },
        { content: ' ', color: TColor.WHITE },
        { content: '$', color: TColor.EMERALD },
        { content: ' ', color: TColor.WHITE },
      ]"
      ref="editableLine"
      @submit="onSubmit"
      @update-content="onUpdateContent"
      @line-up="onLineUp"
      @line-down="onLineDown"
    />
  </div>
</template>
