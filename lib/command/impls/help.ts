import { Command, type CommandFunc } from './types';
import { formatArg } from '../utils';

type CommandDescription = Record<Command, string>;

const commandDescriptions: CommandDescription = {
  [Command.ECHO]: 'this command do something',
  [Command.HELP]: 'this command do something'
};

export const help: CommandFunc = function(...args) {
  args.shift();
  args.shift();

  const commandName = formatArg(args[0]);
  return [
    commandDescriptions[commandName as Command] || 'cc cút'
  ];
};
