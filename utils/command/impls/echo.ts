import type { TCommand } from './types';

const colorCodes = {
  '\u001b[30m': TColor.BLACK,
  '\u001b[31m': TColor.RED,
  '\u001b[32m': TColor.GREEN,
  '\u001b[33m': TColor.YELLOW,
  '\u001b[34m': TColor.BLUE,
  '\u001b[35m': TColor.PURPLE,
  '\u001b[36m': TColor.CYAN,
  '\u001b[37m': TColor.WHITE,
  '\u001b[95m': TColor.PINK,
};

export const echo: TCommand = function (...args) {
  args.shift();
  return [args.flatMap((arg) => {
    if (!arg.trim()) return [{ content: ' ', color: TColor.WHITE }];
    const chunks = formatArg(arg).split(/(\u001b\[[0-9]*m)/);
    const res = [{ content: chunks.shift()!, color: TColor.WHITE }];
    while (chunks.length) {
      const color = (colorCodes as any)[chunks.shift()!] || TColor.WHITE;
      const text = chunks.shift()!;
      res.push({ content: text, color });
    }
    return res;
  })];
}
