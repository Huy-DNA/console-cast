import { Color, type ColoredContent } from '~/lib/types';

export function formatArg (arg: string): string {
  if (arg[0] === '\'') {
    arg = arg.slice(1);
    if (arg[arg.length - 1] === '\'') {
      arg = arg.slice(0, arg.length - 1);
    }
  } else if (arg[0] === '"') {
    arg = arg.slice(1);
    if (arg[arg.length - 1] === '"') {
      arg = arg.slice(0, arg.length - 1);
    }
  }

  return arg;
}

const colorCodes = {
  '\\u001b[30m': Color.BLACK,
  '\\u001b[31m': Color.RED,
  '\\u001b[32m': Color.GREEN,
  '\\u001b[33m': Color.YELLOW,
  '\\u001b[34m': Color.BLUE,
  '\\u001b[35m': Color.PURPLE,
  '\\u001b[36m': Color.CYAN,
  '\\u001b[37m': Color.WHITE,
  '\\u001b[95m': Color.PINK,
};

export function interpretAnsiEscapeColor (content: string[]): ColoredContent {
  return content.map((line) => {
    const chunks = line.split(/(\\u001b\[[0-9]*m)/);
    const res = [{ content: chunks.shift()!, color: Color.WHITE }];
    while (chunks.length) {
      const color = (colorCodes as any)[chunks.shift()!] || Color.WHITE;
      const text = chunks.shift()!;
      res.push({ content: text, color });
    }
    return res;
  });
}
