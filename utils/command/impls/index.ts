import { echo } from './echo';
import { TCommandName } from './types';

export * from './types';

export async function execute (...args: string[] & { 0: TCommandName }): Promise<TLine[]> {
  if (!args[0].trim()) {
    args.shift();
  }
  if (!args.length) {
    return [[{ content: ' ', color: TColor.WHITE }]];
  }
  switch (args[0]) {
    case TCommandName.ECHO:
      return echo(args as any);
    default:
      return echo('echo', `Unknown command:\u001b[31m ${args[0]}`);
  }
}
