<script setup lang="ts">
  const props = defineProps<{ content: string }>();

  const emits = defineEmits<{
    keypress: [key: string, offset: number],
  }>();
</script>

<template>
  <p role="text" class="flex justify-start gap-0 w-[100%]">
  </p>
</template>
