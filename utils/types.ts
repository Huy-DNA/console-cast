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

// A word is a sequence of non-space tokens and also includes all preceding spaces
export interface TWord {
  content: string;
  color: TColor;
}

// A line is a sequence of words
export type TLine = TWord[];

// A content is a sequence of lines
export type TContent = TLine[];

// Cursor position
export interface TCursorPosition {
  line: number;
  offset: number;
}

export type TCommand = (...args: string[]) => TContent;
