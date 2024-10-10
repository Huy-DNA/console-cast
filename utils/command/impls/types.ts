export type TCommand = (...args: string[]) => TContent;

export enum TCommandName {
  ECHO = 'echo',
}
