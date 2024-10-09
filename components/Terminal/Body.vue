<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<string> = ref('');
</script>

<template>
  <div class="pl-2">
    <TerminalContent :content="content" />
    <TerminalEditableLine :content="currentLine" />
  </div>
</template>
