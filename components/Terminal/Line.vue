<script setup lang="ts">
  import { ColoredLine } from '~/lib';

  const props = defineProps<{ line: ColoredLine }>();

  const root = useTemplateRef('root');

  defineExpose({
    root,
  });
</script>

<template>
  <p
    role="text"
    class="flex justify-start gap-0 w-[100%]"
    ref="root"
    tabindex="0"
  >
    <TerminalWord
      v-for="(word, index) in props.line"
      :key="index"
      :word="word"
    />
  </p>
</template>
