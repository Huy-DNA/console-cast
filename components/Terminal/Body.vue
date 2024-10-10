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
    let node: Node | null = null;
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
        if (offset === currentLine.value.length) return;
        cursorPosition.value.offset += 1;
        return;
      case 'ArrowUp':
        return;
      case 'ArrowDown':
        return;
      case 'Backspace':
        if (offset === 0) return;
        currentLine.value = currentLine.value.slice(0, offset - 1) + currentLine.value.slice(offset);
        cursorPosition.value.offset -= 1;
        return;
      case 'Delete':
        if (offset === currentLine.value.length) return;
        currentLine.value = currentLine.value.slice(0, offset) + currentLine.value.slice(offset + 1);
        return;
      default:
        if (line !== lineCount.value - 1 || key.length !== 1) return;
        currentLine.value = currentLine.value.slice(0, offset) + key + currentLine.value.slice(offset);
        cursorPosition.value.offset += 1;
    }
  }

  function onEnter ({ line }: { line: TLine }) {
    content.value.push(line);
    currentLine.value = '';
    cursorPosition.value.offset = 0;
    cursorPosition.value.line += 1;
  }

  function onClick () {
    const selection = window.getSelection();
    if (selection?.type !== 'Range') editableLine.value.root.focus();
  }
</script>

<template>
  <div class="pl-2 caret-transparent h-[100%]" @click="onClick">
    <div class="w-2.5 h-[22px] absolute bg-white z-50" id="cursor" />
    <TerminalLine v-for="(line, index) in content" :key="index" :line="line" ref="nonEditableLines" />
    <TerminalEditableLine :content="currentLine" ref="editableLine" @keydown="onKeydown" @enter="onEnter" />
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
