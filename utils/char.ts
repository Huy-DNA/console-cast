export function isSpace (c: string): c is ' ' | '\t' {
  return c === ' ' || c === '\t';
}
