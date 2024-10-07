<script setup lang="ts">
  import { type TContent } from '@/core/printer/types.ts';

  const props = defineProps<{ content: TContent }>();
</script>

<template>
  <div>
    <TerminalLine v-for="(index, line) in props.content" :key="index" :line="{ line }" />
  </div>
</template>
