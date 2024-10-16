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

//const colorCodes = {
//  '\\u001b[30m': Color.BLACK,
//  '\\u001b[31m': Color.RED,
//  '\\u001b[32m': Color.GREEN,
//  '\\u001b[33m': Color.YELLOW,
//  '\\u001b[34m': Color.BLUE,
//  '\\u001b[35m': Color.PURPLE,
//  '\\u001b[36m': Color.CYAN,
//  '\\u001b[37m': Color.WHITE,
//  '\\u001b[95m': Color.PINK,
//};
function getDescription(commandName: string): string[] {
  const commandDescription = commandDescriptions[commandName as Command];
  if (commandDescription !== undefined) {
    return [
      `Description: ${commandDescription.description}\n`,
      ...commandDescription.usages.flatMap(({ usage, args }) =>
        [`- ${usage}`,
          `    ${commandName} ${args.join(' ')}`])
    ];
  } else {
    return [`No entry in index: ${commandName}`];
  }
}

export const help: CommandFunc = function(...args) {
  args.shift();
  args.shift();


  const commandName = formatArg(args[0]);
  return getDescription(commandName);
};
