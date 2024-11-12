export type CommandFunc = (...args: string[]) => string[];
export type AsyncCommandFunc = (...args: string[]) => Promise<string[]>;

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
  CP = 'cp',
  MV = 'mv',
}
