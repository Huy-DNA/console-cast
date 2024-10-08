<script setup lang="ts">
  const props = defineProps<{ word: TWord; editable?: boolean }>();

  const emits = defineEmits<{
    input: [word: string];
  }>();

  async function onInput (e: InputEvent) {
    await emits('input', (e.target as any).value);
  }
</script>

<template>
  <input
    v-if="props.editable || false"
    :size="props.word.content.length"
    :class="`text-${props.word.color} outline-none bg-black p-0 m-0`"
    :value="props.word.content"
    spellcheck="false"
    @input="onInput"
  >
  <input
    v-else
    :size="props.word.content.length"
    :class="`text-${props.word.color} bg-black p-0 m-0`"
    :value="props.word.content"
  >
</template>
