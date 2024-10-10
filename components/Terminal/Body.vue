<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const lineCount = computed(() => content.value.length + 1);

  const editableLine = ref(null);

  function onClick () {
    const selection = window.getSelection();
    if (selection?.type !== 'Range') editableLine.value.root.focus();
  }

  function onSubmit ({ line }: { line: TLine }) {
    content.value.push(line);
  }

  function onScroll () {
    editableLine.value.updateCursor();
  }
</script>

<template>
  <div
    class="pl-2 caret-transparent h-[88vh] overflow-auto"
    @click="onClick"
    @scroll="onScroll"
  > 
    <TerminalLine
      v-for="(line, index) in content"
      :key="index"
      :line="line"
      ref="nonEditableLines"
    />
    <TerminalEditableLine
      :content="currentLine"
      ref="editableLine"
      @submit="onSubmit"
    />
  </div>
</template>
