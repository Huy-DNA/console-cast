export function trimQuote (value: string): string {
  if (['"', '\''].includes(value[0])) {
    value = value.slice(1);
  }
  if (['"', '\''].includes(value[value.length - 1])) {
    value = value.slice(0, value.length - 1);
  }
  return value;
}
