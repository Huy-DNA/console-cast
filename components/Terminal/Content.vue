<script setup lang="ts">
  import { type TContent } from '@/core/types.ts';

  const props = defineProps<{ content: TContent }>();
</script>

<template>
  <div>
    <TerminalLine v-for="(line, index) in props.content" :key="index" :line="line" />
  </div>
</template>
