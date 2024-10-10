<script setup lang="ts">
</script>

<template>
  <main class="terminal w-[100vw] min-h-[100vh] bg-black text-white pt-5 pl-3 overflow-hidden">
    <TerminalHeader />
    <TerminalBody />
  </main>
</template>

<style>
  .terminal * {
    white-space: pre;
    font-family: ProtoNerdFont, 'Courier New', Courier, monospace;
  }
</style>
