<script setup lang="ts">
import type { ColoredLine } from '~/lib';

const props = defineProps<{ line: ColoredLine }>();

const root = useTemplateRef('root');

defineExpose({
  root,
});
</script>

<template>
  <p
    ref="root"
    role="text"
    class="flex justify-start gap-0 w-[100%]"
    tabindex="0"
  >
    <TerminalWord
      v-for="(word, index) in props.line"
      :key="index"
      :word="word"
    />
  </p>
</template>
