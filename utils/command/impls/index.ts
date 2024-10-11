import { echo } from './echo';
import { TCommandName } from './types';

export * from './types';

export async function execute (...args: string[]): Promise<TLine[]> {
  if (!args[0].trim()) {
    args.shift();
  }
  if (!args.length) {
    return [[{ content: ' ', color: TColor.WHITE }]];
  }
  switch (args[0]) {
    case TCommandName.ECHO:
      return echo(...args as any);
    default:
      return echo('echo', `Unknown command:\u001b[31m ${args[0]}`);
  }
}

export function formatArg (arg: string): string {
  if (arg[0] === "\'") {
    arg = arg.slice(1);
    if (arg[arg.length - 1] === "\'") {
      arg = arg.slice(0, arg.length - 1);
    }
  } else if (arg[0] === "\"") {
    arg = arg.slice(1);
    if (arg[arg.length - 1] === "\"") {
      arg = arg.slice(0, arg.length - 1);
    }
  }

  return arg;
}
