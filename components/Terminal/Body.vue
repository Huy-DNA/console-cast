<script setup lang="ts">
  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<TLine> = ref([]);

  function onInput ({ word, index }: { word: string; index: number }) {
    // if the word is appended at the end
    if (index === currentLine.value.length) {
      currentLine.value.push({ content: word, color: TColor.WHITE });
    } else {
      // otherwise an existing word is modified
      currentLine.value[index].content = word;
    }
    const line = currentLine.value.map(({ content }) => content).join('');
    const chunks = line.split(/(\s+)/);
    if (chunks[0] === '') chunks.shift();
    if (chunks[chunks.length - 1] === '') chunks.pop();
    
    currentLine.value = chunks.map((chunk) => ({ content: chunk, color: TColor.WHITE }));
  }
</script>

<template>
  <div class="pl-2">
    <TerminalContent :content="content" />
    <TerminalLine :line="currentLine" editable @input="onInput" />
  </div>
</template>
