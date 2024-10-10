<script setup lang="ts">
  const props = defineProps<{
    content: string,
  }>();

  const emits = defineEmits<{
    submit: [TLine],
    'update-content': [string],
    'line-up': void,
    'line-down': void,
  }>();

  const cursorPosition: Ref<TCursorPosition> = ref({ offset: 0 });

  const inputBox = useTemplateRef('input-box');

  const words = computed(() => {
    return parse(props.content);
  });
  const coloredWords = computed(() => {
    return highlight(words.value);
  });

  // auto-focus input box 
  // onMounted(() => inputBox.value.focus());

  watch(cursorPosition, updateCursor, { deep: true });
  function updateCursor () {
    const { offset } = cursorPosition.value;
    const position = getCharPosition(offset);
    const cursor = document.getElementById('cursor');
    cursor!.style.top = `${position.top}px`;
    cursor!.style.left = `${position.left}px`;
  }
  function getCharPosition (offset: number): { top: number, left: number } {
    let characterCount = 0;
    const walker = document.createTreeWalker(inputBox.value, NodeFilter.SHOW_TEXT, null, false);
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

  async function onKeydown (e: KeyboardEvent) {
    e.stopImmediatePropagation();
    inputBox.value.scrollIntoView();
    if (e.key === 'Enter') {
      cursorPosition.value.offset = 0;
      emits('submit', coloredWords.value);
      return;
    }
    const { offset } = cursorPosition.value;
    const { content } = props;
    switch (e.key) {
      case 'ArrowLeft':
        if (offset === 0) return;
        cursorPosition.value.offset -= 1;
        setTimeout(() => inputBox.value.focus(), 50);
        return;
      case 'ArrowRight':
        if (offset === content.length) return;
        cursorPosition.value.offset += 1;
        setTimeout(() => inputBox.value.focus(), 50);
        return;
      case 'ArrowUp':
        emits('line-up');
        await nextTick();
        cursorPosition.value.offset = props.content.length;
        setTimeout(() => inputBox.value.focus(), 50);
        return;
      case 'ArrowDown':
        emits('line-down');
        await nextTick();
        cursorPosition.value.offset = props.content.length;
        setTimeout(() => inputBox.value.focus(), 50);
        return;
      case 'Backspace':
        if (offset === 0) return;
        emits('update-content', content.slice(0, offset - 1) + content.slice(offset));
        cursorPosition.value.offset -= 1;
        return;
      case 'Delete':
        if (offset === content.value.length) return;
        emits('update-content', content.slice(0, offset) + content.slice(offset + 1));
        return;
      default:
        if (e.key.length !== 1) return;
        emits('update-content', content.slice(0, offset) + e.key + content.slice(offset));
        cursorPosition.value.offset += 1;
    }
  }

  function onClick (e: MouseEvent) {
    const range = document.createRange();

    range.setStart(inputBox.value, 0);
    range.setEnd(inputBox.value, inputBox.value.childNodes.length);

    const caretOffset = document.caretPositionFromPoint(e.clientX, e.clientY).offset;
    if (caretOffset > props.content.length) {
      cursorPosition.value.offset = props.content.length;
    } else {
      cursorPosition.value.offset = caretOffset;
    }
  }

  defineExpose({
    root: inputBox,
    updateCursor,
  });
</script>

<template>
  <p
    role="text"
    class="flex justify-start gap-0 w-[100%] outline-none"
    tabindex="0"
    @keydown="onKeydown"
    @click="onClick"
    ref="input-box"
  >
    <span
      class="w-2.5 h-[22px] absolute block bg-white z-50"
      id="cursor"
    />
    <TerminalWord
      v-for="(word, index) in coloredWords"
      :key="index"
      :word="word"
    />
    &nbsp;
  </p>
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
