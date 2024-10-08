<script setup lang="ts">
  const props = defineProps<{ word: TWord; editable?: boolean }>();

  const emits = defineEmits<{
    input: [word: string];
  }>();

  async function onInput (e: InputEvent) {
    await emits('input', (e.target as any).value);
  }

  const inputRef = useTemplateRef('terminal-input-word');
  function onKeyLeft (e: Event) {
    const cursorPos = inputRef.value.selectionStart;
    if (cursorPos > 0) return;

    const terminalWordNodes = [...document.querySelectorAll('.terminal-input-word')];
    if (terminalWordNodes[0] === inputRef.value) return;
    const curIndex = terminalWordNodes.indexOf(inputRef.value);
    const prevWordNode = terminalWordNodes[curIndex - 1] as HTMLInputElement;
    prevWordNode.focus();
    const prevWordLen = prevWordNode.value.length;
    prevWordNode.setSelectionRange(prevWordLen, prevWordLen);
    e.stopPropagation();
  }

  function onKeyRight (e: Event) {
    const curWordLen = inputRef.value.value.length;
    const cursorPos = inputRef.value.selectionStart;
    if (cursorPos < curWordLen) return;

    const terminalWordNodes = [...document.querySelectorAll('.terminal-input-word')];
    const curIndex = terminalWordNodes.indexOf(inputRef.value);
    if (curIndex === terminalWordNodes.length - 1) return;
    const nextWordNode = terminalWordNodes[curIndex + 1] as HTMLInputElement;
    nextWordNode.focus();
    nextWordNode.setSelectionRange(0, 0);
    e.stopPropagation();
  }
</script>

<template>
  <input
    v-if="props.editable || false"
    :size="props.word.content.length || 1"
    :class="`terminal-input-word text-${props.word.color} outline-none bg-black p-0 m-0 caret-white`"
    :value="props.word.content"
    spellcheck="false"
    aria-hidden="false"
    role="hidden"
    tabindex="-1"
    ref="terminal-input-word"
    @input="onInput"
    @keydown.left="onKeyLeft"
    @keydown.right="onKeyRight"
  >
  <input
    v-else
    aria-hidden="false"
    role="hidden"
    tabindex="-1"
    :size="props.word.content.length"
    :class="`text-${props.word.color} bg-black p-0 m-0`"
    :value="props.word.content"
  >
</template>
