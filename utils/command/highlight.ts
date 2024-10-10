export function highlight (args: string[]): TWord[] {
  let nonspaceArgIndex = 0;
  return args.map((arg) => {
    if (!arg.trim()) {
      return { content: arg, color: TColor.WHITE };
    }
    nonspaceArgIndex += 1;
    if (arg.match(/^[0-9]+$/)) {
      return { content: arg, color: TColor.PINK };
    }
    if (["\'", "\""].includes(arg[0])) {
      return { content: arg, color: TColor.CYAN };
    }
    if (nonspaceArgIndex === 1) {
      return { content: arg, color: Object.values(TCommandName).includes(arg as any) ? TColor.GREEN : TColor.RED };
    }
    return { content: arg, color: TColor.WHITE };
  });
}
