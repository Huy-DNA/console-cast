<script setup lang="ts">
  const props = defineProps<{ content: string }>();

  const emits = defineEmits<{
    keydown: [{ key: string }],
    click: [{ offset: number }],
  }>();

  const words = computed(() => {
    return props.content.split(/(\s+)/);
  });

  const coloredWords = computed(() => {
    return words.value.map((word) => ({
      content: word,
      color: TColor.WHITE,
    }));
  });

  const inputBox = useTemplateRef('input-box');

  function onKeydown (e: KeyboardEvent) {
    emits('keydown', { key: e.key });
  }

  function onClick (e: MouseEvent) {
    const range = document.createRange();

    range.setStart(inputBox.value, 0);
    range.setEnd(inputBox.value, inputBox.value.childNodes.length);

    const caretOffset = document.caretPositionFromPoint(e.clientX, e.clientY).offset;
    emits('click', { offset: caretOffset });
  }

  onMounted(() => inputBox.value.focus());
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
    <TerminalWord v-for="(word, index) in coloredWords" :key="index" :word="word" />
    &nbsp;
  </p>
</template>
