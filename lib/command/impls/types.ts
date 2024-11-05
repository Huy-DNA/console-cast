export type CommandFunc = (...args: string[]) => Promise<string[]> | string[];

export enum Command {
  ECHO = 'echo',
  HELP = 'help',
  CD = 'cd',
  SU = 'su',
  LS = 'ls',
  USERADD = 'useradd',
  TOUCH = 'touch',
  MKDIR = 'mkdir',
  UMASK = 'umask',
  RM = 'rm',
}
