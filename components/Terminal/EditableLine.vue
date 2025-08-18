<script setup lang="ts">
import type { ColoredLine, ColoredWord } from '~/utils';
import { highlight, Color } from '~/utils';

const props = defineProps<{
  content: string,
  prefix: ColoredWord[],
}>();

const words = computed(() => {
  return highlight(props.content);
});

const emits = defineEmits<{
  enter: [ColoredLine],
  input: [string],
  'arrow-up': [],
  'arrow-down': [],
}>();

const inputBox = useTemplateRef('input-box');
const inputBoxWrapper = useTemplateRef('input-box-wrapper');
function focus () {
  inputBox.value?.focus();
  inputBoxWrapper.value?.scrollIntoView();
}

const cursorOffset = ref(0);
watch(cursorOffset, function () {
  const offset = cursorOffset.value;
  const cursor = document.getElementById('cursor');
  cursor!.style.left = `${offset}ch`;
});

async function onKeydown (e: KeyboardEvent) {
  if (e.key === 'Enter') {
    cursorOffset.value = 0;
    emits('enter', props.content === '' ? [{ content: '', color: Color.WHITE }] : words.value);
    return;
  }
  const offset = cursorOffset.value;
  const { content } = props;
  switch (e.key) {
  case 'ArrowLeft':
    if (offset === 0) return;
    cursorOffset.value -= 1;
    return;
  case 'ArrowRight':
    if (offset === content.length) return;
    cursorOffset.value += 1;
    return;
  case 'ArrowUp':
    emits('arrow-up');
    await nextTick();
    cursorOffset.value = props.content.length;
    return;
  case 'ArrowDown':
    emits('arrow-down');
    await nextTick();
    cursorOffset.value = props.content.length;
    return;
  case 'Backspace':
    if (offset === 0) return;
    emits('input', content.slice(0, offset - 1) + content.slice(offset));
    cursorOffset.value -= 1;
    return;
  case 'Delete':
    if (offset === content.length) return;
    emits('input', content.slice(0, offset) + content.slice(offset + 1));
    return;
  default:
    if (e.key.length !== 1) return;
    emits('input', content.slice(0, offset) + e.key + content.slice(offset));
    cursorOffset.value += 1;
  }
}

function onClick (e: MouseEvent) {
  if (!inputBox.value) {
    return;
  }
  const range = document.createRange();
  range.setStart(inputBox.value, 0);
  range.setEnd(inputBox.value, inputBox.value.childNodes.length);

  const caretOffset = document.caretPositionFromPoint(e.clientX, e.clientY).offset;
  cursorOffset.value = caretOffset > props.content.length ? props.content.length : caretOffset;
}

defineExpose({
  focus,
});
</script>

<template>
  <div ref="input-box-wrapper" class="m-0 p-0" tabindex="0">
    <TerminalWord v-for="(word, index) in props.prefix" :key="index" :word="word" />
    <p
ref="input-box" role="text" class="inline-flex justify-start gap-0 w-[90%] outline-none relative" tabindex="0"
      @keydown="onKeydown" @click="onClick">
      <span id="cursor" class="w-2.5 h-[22px] absolute block bg-white z-50" />
      <TerminalWord v-for="(word, index) in words" :key="index" :word="word" />
      &nbsp;
    </p>
  </div>
</template>

<style scoped>
@keyframes blink {
  0%,
  20%,
  80%,
  100% {
    opacity: 0.7;
  }

  30%,
  60% {
    opacity: 0;
  }
}

#cursor {
  animation: blink 1s infinite;
}
</style>
