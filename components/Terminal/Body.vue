<script setup lang="ts">
  import { type TContent, type TLine, TColor } from '@/core/types';
  import { isSpace } from '@/core/utils';

  const content: Ref<TContent> = ref([]);
  const currentLine: Ref<TLine> = ref([]);

  function splitWordPosition (word: string): number {
    let isNonSpaceEncountered = false;
    for (let i = 0; i < word.length; ++i) {
      const c = word[i];
      if (isNonSpaceEncountered && isSpace(c)) {
        return i;
      }
      isNonSpaceEncountered ||= !isSpace(c);
    }
    return -1;
  }

  function onInput ({ word, index }: { word: string; index: number }) {
    // if the word is appended at the end
    if (index === currentLine.value.length) {
      currentLine.value.push({ content: word, color: TColor.WHITE});
    } else {
      // otherwise an existing word is modified
      currentLine.value[index].content = word;
    }

    const splitPos = splitWordPosition(word);
    if (splitPos === -1) {
      if (word.trim() && index > 0) {
        currentLine.value[index - 1].content += word;
        currentLine.value.splice(index, 1);
        return;
      }
      if (index < currentLine.value.length - 1) {
        currentLine.value[index + 1].content = word + currentLine.value[index + 1].content;
        currentLine.value.splice(index, 1);
        return;
      }
      return;
    }
    const firstWord = word.slice(0, splitPos);
    const secondWord = word.slice(splitPos);
    currentLine.value[index].content = firstWord;
    if (secondWord.trim()) {
      currentLine.value.splice(index + 1, 0, { content: secondWord, color: TColor.WHITE });
      return;
    }
    if (index < currentLine.value.length - 1) {
      currentLine.value[index + 1].content = secondWord + currentLine.value[index + 1].content;
      return;
    }
  }
</script>

<template>
  <div class="pl-2">
    <TerminalContent :content="content" />
    <TerminalLine :line="currentLine" editable @input="onInput" />
  </div>
</template>
