<script setup lang="ts">
  import { type TContent } from '@/core/types';

  type Word = string;
  type Line = Word[];
  type Content = Line[];

  const content: Content = [];
  const tcontent: TContent = [];
</script>

<template>
  <div>
    <TerminalContent />
    <TerminalLine />
  </div>
</template>
