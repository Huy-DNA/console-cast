<script setup lang="ts">
  const props = defineProps<{ content: string }>();

  const emits = defineEmits<{
    keydown: [{ key: string }],
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
</script>

<template>
  <p
    role="text"
    class="flex justify-start gap-0 w-[100%]"
    tabindex="0"
    @keydown="onKeydown"
    ref="input-box"
  >
    <TerminalWord v-for="(word, index) in coloredWords" :key="index" :word="word" />
    &nbsp;
  </p>
</template>
