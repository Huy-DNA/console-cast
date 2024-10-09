<script setup lang="ts">
  const props = defineProps<{ content: string }>();

  const emits = defineEmits<{
    keypress: [key: string, offset: number],
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
</script>

<template>
  <p role="text" class="flex justify-start gap-0 w-[100%]">
    <TerminalWord v-for="(word, index) in coloredWords" :key="index" :word="word" />
  </p>
</template>
