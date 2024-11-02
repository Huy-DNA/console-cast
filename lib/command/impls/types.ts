export type CommandFunc = (...args: string[]) => string[];

export enum Command {
  ECHO = 'echo',
  HELP = 'help',
  CD = 'cd',
}
