import { Color, type ColoredLine } from '~/lib';
import { Command } from '../command/impls/types';
import { parse } from './parse';

export function highlight (command: string): ColoredLine {
  const args = parse(command);
  let nonspaceArgIndex = 0;
  return args.map((arg) => {
    if (!arg.trim()) {
      return { content: arg, color: Color.WHITE };
    }
    nonspaceArgIndex += 1;
    if (arg.match(/^[0-9]+$/)) {
      return { content: arg, color: Color.PINK };
    }
    if (['\'', '"'].includes(arg[0])) {
      return { content: arg, color: Color.CYAN };
    }
    if (nonspaceArgIndex === 1) {
      return { content: arg, color: Object.values(Command).includes(arg as any) ? Color.GREEN : Color.RED };
    }
    return { content: arg, color: Color.WHITE };
  });
}
