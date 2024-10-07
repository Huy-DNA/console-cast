export enum TColor {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  CYAN = 'cyan',
  PINK = 'pink',
  TEAL = 'teal',
  PURPLE = 'purple',
  WHITE = 'white',
  BLACK = 'black',
  EMERALD = 'emerald',
}

export interface TWord {
  readonly content: string;
  readonly color: TColor;
}

export type TLine = TWord[];

export type TContent = TLine[];
