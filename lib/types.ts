export enum Color {
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
export interface ColoredWord {
  content: string;
  color?: Color;
}

// A line is a sequence of words
export type ColoredLine = ColoredWord[];

// A content is a sequence of lines
export type ColoredContent = ColoredLine[];
