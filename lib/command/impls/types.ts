export type CommandFunc = (...args: string[]) => Promise<string[]> | string[];

export enum Command {
  ECHO = 'echo',
  HELP = 'help',
  CD = 'cd',
}
