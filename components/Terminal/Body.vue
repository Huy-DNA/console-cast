<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const cursorPosition: Ref<TCursorPosition> = ref({ line: 0, offset: 0 });
  const nonEditableLines = ref(null);
  const editableLine = ref(null);
  
  const lineCount = computed(() => content.value.length + 1);
  const lineNodes = computed(() => [...(nonEditableLines.value || []).map(({ root }) => root), editableLine.value.root]);
  const cursorPositionInViewport = computed(() => {
    const { line, offset } = cursorPosition.value;
    const lineNode = lineNodes.value[line];
    return getCharPosition(lineNode, offset);
  });
 
  function getCharPosition (element: Element, offset: number) {
    let characterCount = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const textLength = node.textContent!.length;
      if (characterCount + textLength > offset) {
        const charIndex = offset - characterCount;
        const range = new Range();
        range.setStart(node, charIndex);
        range.setEnd(node, charIndex + 1);

        const rect = range.getBoundingClientRect(); 
        return { top: rect.top, left: rect.left };
      }
    }
  };
</script>

<template>
  <div class="pl-2 caret-transparent">
    <TerminalLine v-for="(line, index) in content" :key="index" :line="line" ref="nonEditableLines" />
    <TerminalEditableLine :content="currentLine" ref="editableLine" />
  </div>
</template>
