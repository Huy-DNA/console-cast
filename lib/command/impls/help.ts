import { Command, type CommandFunc } from './types';
import { formatArg } from '../utils';
type CommandUsage = {
  args: string[],
}
type CommandDescription = {
  description: string;
  usages: CommandUsage[]
}

const commandDescriptions: Record<Command, CommandDescription> = {
  [Command.ECHO]: {
    description: 'Echo back given arguments',
    usages: [
      { args: ['<arg>*'] },
    ],
  },
  [Command.HELP]: {
    description: 'Get simple usage for a command registered in the help index',
    usages: [
      { args: ['<command>'] },
    ],
  },
};

function getDescription(commandName: string): string[] {
  const commandDescription = commandDescriptions[commandName as Command];
  if (commandDescription !== undefined) {
    return [
      `${commandName} - ${commandDescription.description}\n`,
      ...commandDescription.usages.map(({ args }) =>
        `Usage: ${commandName} ${args.join(' ')}`),
    ];
  } else {
    return [`No entry found: \\u001b[31m${commandName}`];
  }
}

export const help: CommandFunc = function(...args) {
  args.shift();
  args.shift();

  if (args.length === 0 || !args[0].trim()) {
    return [
      'Please specify one of these commands:',
      ...Object.values(Command).sort().map((name) => `- ${name}`),
    ];
  }

  const commandName = formatArg(args[0]);
  return getDescription(commandName);
};
