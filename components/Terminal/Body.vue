<script setup lang="ts">
  import { type TContent, type TLine, TColor } from '@/core/types';

  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<TLine> = ref([]);
</script>

<template>
  <div>
    <TerminalContent :content="content" />
    <TerminalLine :line="currentLine" editable />
  </div>
</template>
