import type { TColor, TWord } from './types'

export class TPrinter {
  private defaultColor: TColor;

  constructor (defaultColor: TColor) {
    this.defaultColor = defaultColor;
  }

  printWord (word: string, color = this.defaultColor): TWord {
    return {
      content: word,
      color,
    }
  }
}
