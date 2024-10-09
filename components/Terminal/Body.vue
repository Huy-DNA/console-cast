<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
  const cursorPosition: Ref<TCursorPosition> = ref({ line: 0, offset: 0 });
  const nonEditableLines = ref(null);
  const editableLine = ref(null);
  
  const lineCount = computed(() => content.value.length + 1);
  const lineNodes = computed(() => {
    if (!editableLine.value) return [];
    return [...(nonEditableLines.value || []).map(({ root }) => root), editableLine.value.root];
  });

  watch([cursorPosition, lineNodes], () => {
    const { line, offset } = cursorPosition.value;
    const lineNode = lineNodes.value[line];
    const position = lineNode ? getCharPosition(lineNode, offset) : { top: 0, left: 0 };
    const cursor = document.getElementById('cursor');
    cursor!.style.top = `${position.top}px`;
    cursor!.style.left = `${position.left}px`;
  }, { deep: true });
 
  function getCharPosition (element: Element, offset: number): { top: number, left: number } {
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
      characterCount += textLength;
    }
    return { top: 0, left: 0 };
  };

  function onKeydown ({ key }: { key: string }) {
    const { line, offset } = cursorPosition.value;
    switch (key) {
      case 'ArrowLeft':
        if (offset === 0) return;
        cursorPosition.value.offset -= 1;
        return;
      case 'ArrowRight':
        const curLength = lineNodes.value[line].innerText.length - 4;
        if (offset === curLength) return;
        cursorPosition.value.offset += 1;
        return;
      case 'ArrowUp':
        if (line === 0) return;
        cursorPosition.value.line -= 1;
        return;
      case 'ArrowDown':
        if (line === lineCount.value - 1) return;
        cursorPosition.value.line += 1;
        return;
      default:
        if (line !== lineCount.value - 1 || key.length !== 1) return;
        currentLine.value = currentLine.value.slice(0, offset) + key + currentLine.value.slice(offset);
        cursorPosition.value.offset += 1;
    }
  }
</script>

<template>
  <div class="pl-2 caret-transparent">
    <div class="w-2 h-[22px] absolute bg-white z-50" id="cursor" />
    <TerminalLine v-for="(line, index) in content" :key="index" :line="line" ref="nonEditableLines" @keydown="onKeydown" />
    <TerminalEditableLine :content="currentLine" ref="editableLine" @keydown="onKeydown" />
  </div>
</template>

<style scoped>
  @keyframes blink {
    0%, 20%, 80%, 100% {
      opacity: 0.7;
    }
    
    
    30%, 60% {
      opacity: 0;
    }
  }

  #cursor {
    animation: blink 1s infinite;
  }
</style>
