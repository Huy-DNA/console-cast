export function highlight (args: string[]): TWord[] {
  let nonspaceArgIndex = 0;
  return args.map((arg) => {
    if (!arg.trim()) {
      return { content: arg, color: TColor.WHITE };
    }
    nonspaceArgIndex += 1;
    if (["\'", "\""].includes(arg[0])) {
      return { content: arg, color: TColor.CYAN };
    }
    if (nonspaceArgIndex === 1) {
      return { content: arg, color: TColor.GREEN };
    }
    return { content: arg, color: TColor.WHITE };
  });
}
