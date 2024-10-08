<script setup lang="ts">
  import { type TContent, type TLine, TColor } from '@/core/types';

  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<TLine> = ref([]);

  function splitWordPosition (word: string): number {
    let isNonSpaceEncountered = false;
    for (let i = 0; i < word.length; ++i) {
      const c = word[i];
      if (isNonSpaceEncountered && (c === ' ' || c === '\t')) {
        return i;
      }
      isNonSpaceEncountered ||= (c === ' ' || c === '\t');
    }
    return -1;
  }

  function onInput ({ word, index }: { word: string; index: number }) {
    if (index === currentLine.value.length) {
      currentLine.value.push({ content: word, color: TColor.WHITE });
      return;
    }
    const splitPos = splitWordPosition(word);
    if (splitPos === -1) {
      currentLine.value[index].content = word;
      return;
    }
    const firstWord = word.slice(0, splitPos);
    const secondWord = word.slice(splitPos);
    currentLine.value[index].content = firstWord;
    currentLine.value.splice(index, 0, { content: secondWord, color: TColor.WHITE });
  }
</script>

<template>
  <div>
    <TerminalContent :content="content" />
    <TerminalLine :line="currentLine" editable @input="onInput" />
  </div>
</template>
