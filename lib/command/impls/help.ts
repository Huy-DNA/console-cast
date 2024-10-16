import { Command, type CommandFunc } from './types';
import { formatArg } from '../utils';
type CommandUsage = {
  usage: string,
  args: string[]
}
type CommandDescription = {
  description: string;
  usages: CommandUsage[]
}

const commandDescriptions: Record<Command, CommandDescription> = {
  [Command.ECHO]: {
    description: 'Print given arguments.',
    usages: [{
      usage: 'Print a text message. Note: quotes are optional',
      args: ['"Hello world"']
    }]

  },
  [Command.HELP]: {
    description: 'Print simple usage for a command registered in the help index.',
    usages: [{
      usage:
        'Print the simple usage for a specific command (hint: this is how you got here!)',
      args: ['<command>']
    }]
  },
};

function getDescription(commandName: string): string[] {
  const commandDescription = commandDescriptions[commandName as Command];
  if (commandDescription !== undefined) {
    return [
      ' ',
      `\\u001b[32m${commandName}`,
      ' ',
      `\\u001b[33mDescription:\\u001b[37m ${commandDescription.description}\n`,
      ' ',
      ...commandDescription.usages.flatMap(({ usage, args }) =>
        [`\\u001b[34m- ${usage}`,
          `    \\u001b[32m${commandName} \\u001b[36m${args.join(' ')}`])
    ];
  } else {
    return [`No entry in index: \\u001b[31m${commandName}`];
  }
}

export const help: CommandFunc = function(...args) {
  args.shift();
  args.shift();


  const commandName = formatArg(args[0]);
  return getDescription(commandName);
};
