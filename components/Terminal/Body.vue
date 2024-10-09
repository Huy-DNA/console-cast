<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<TLine> = ref([]);
</script>

<template>
  <div class="pl-2">
    <TerminalContent :content="content" />
  </div>
</template>
