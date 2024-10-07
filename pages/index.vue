<script setup lang="ts">
</script>

<template>
  <main class="terminal w-[100vw] h-[100vh] bg-background text-white p-5">
    <TerminalHeader />
    <TerminalContent />
  </main>
</template>

<style>
  .terminal * {
    white-space: pre;
    font-family: NerdFontProto, 'Courier New', Courier, monospace;
  }
</style>
