<script setup lang="ts">
import type { ColoredContent, ColoredLine } from '~/utils';
import { Color, execute } from '~/utils';

const { username } = useUserStore();
const { cwd } = useCwdStore();

// previous lines = previous commands + previous outputs
const previousLines: Ref<ColoredContent> = ref([]);
const currentLine = ref('');

const previousCommands: Ref<ColoredContent> = ref([]);
const currentCommandIndex = ref(0);
const totalCommands = computed(() => previousCommands.value.length + 1); // previous commands + current command

const editableLine = useTemplateRef('editable-line');

function onClick () {
  const selection = window.getSelection();
  if (selection?.type !== 'Range') {
    editableLine.value?.focus();
  }
}

async function onEnter (line: ColoredLine) {
  if (line.length > 1 || line[0].content.trim()) {
    previousCommands.value.push(line);
  }
  previousLines.value.push(line);
  const executeOutput = await execute(currentLine.value);
  previousLines.value.push(...executeOutput);
  currentLine.value = '';
  currentCommandIndex.value = totalCommands.value - 1;
  await nextTick();
  editableLine.value?.focus();
}

function onInput (newContent: string) {
  currentLine.value = newContent;
}

function onArrowUp () {
  if (currentCommandIndex.value <= 0) return;
  currentCommandIndex.value -= 1;
  currentLine.value = previousCommands.value[currentCommandIndex.value].map(({ content }) => content).join('');
}

function onArrowDown () { 
  if (currentCommandIndex.value > totalCommands.value - 2) return;
  if (currentCommandIndex.value === totalCommands.value - 2) {
    currentLine.value = '';
    currentCommandIndex.value += 1;
  } else {
    currentLine.value = previousCommands.value[currentCommandIndex.value].map(({ content }) => content).join('');
    currentCommandIndex.value += 1;
  }
}

async function printPrompt () {
  const executeResult = await execute(`echo ┌ \\u001b[35m${cwd.value.toFormattedString(username.value)} \\u001b[38mas \\u001b[34m${username.value}`);
  previousLines.value.push(...executeResult);
}

async function printWelcome () {
  const output = [
    ...await execute('echo Theme inspired by \\u001b[33mcatppuccin\\u001b[38m...'),
    ...await execute('echo " "'),
    ...await execute('echo \\u001b[32m " ／l" "\\u001b[31m              guest@console-cat"'),
    ...await execute('echo \\u001b[32m（ ゜､ ｡７ "\\u001b[30m７７\\u001b[34m       js" "\\u001b[38m        Nuxt 3"'),
    ...await execute('echo \\u001b[32m " l   ~ヽ" "\\u001b[30m７７\\u001b[34m       css" "\\u001b[38m       Tailwind"'),
    ...await execute('echo \\u001b[32m " じしf_,)ノ" "\\u001b[34m        dbms" "\\u001b[38m      PostgreSQL 17 + Zapatos"'),
    ...await execute('echo "\\u001b[34m                    runtime" "\\u001b[38m   bun"'),
    ...await execute('echo " "'),
  ];
  previousLines.value.push(...output); 
}

onMounted(async () => {
  await printWelcome();
  await printPrompt();
  editableLine.value?.focus();
});
</script>

<template>
  <div
    class="pl-2 caret-transparent h-[85vh] overflow-auto"
    @click="onClick"
  > 
    <TerminalLine
      v-for="(line, index) in previousLines"
      :key="index"
      :line="line"
    />
    <TerminalEditableLine
      ref="editable-line"
      :content="currentLine"
      :prefix="[
        { content: '└', color: Color.WHITE },
        { content: ' ', color: Color.WHITE },
        { content: '$', color: Color.EMERALD },
        { content: ' ', color: Color.WHITE },
      ]"
      @enter="onEnter"
      @input="onInput"
      @arrow-up="onArrowUp"
      @arrow-down="onArrowDown"
    />
  </div>

</template>
