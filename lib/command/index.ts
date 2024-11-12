import type { ColoredContent } from '~/lib';
import { echo } from './impls/echo';
import { help } from './impls/help';
import { Command } from './impls/types';
import { interpretAnsiEscapeColor } from './utils';
import { parse } from '../services/parse';
import { cd } from './impls/cd';
import { su } from './impls/su';
import { ls } from './impls/ls';
import { useradd } from './impls/useradd';
import { touch } from './impls/touch';
import { mkdir } from './impls/mkdir';
import { umask } from './impls/umask';
import { rm } from './impls/rm';
import { cp } from './impls/cp';
import { mv } from './impls/mv';
import { aliasService, Err, fileService, Ok, type Result } from '~/services';
import { cat } from './impls/cat';
import { alias } from './impls/alias';

export async function execute (command: string): Promise<ColoredContent> {
  const commandTokens = parse(command).filter((arg) => arg.trim());
  const resolvedAlias = await resolveAlias(...commandTokens);
  const shellDirRes = extractShellRedirection(...resolvedAlias);
  if (!shellDirRes.isOk()) {
    return interpretAnsiEscapeColor(shellDirRes.error()!);
  }
  const shellDir = shellDirRes.unwrap();
  const { args, redirections } = shellDir;
  const output = args.length ? await commandDispatch(...args) : [];
  if (redirections.length > 0) {
    const redirectionOutput = (await Promise.all(
      redirections.map(
        (redirection) => redirectOutput(output, redirection),
      ),
    )).flatMap((arg) => arg);
    return interpretAnsiEscapeColor(redirectionOutput);
  }
  return interpretAnsiEscapeColor(output);
}

async function commandDispatch (...args: string[]): Promise<string[]> {
  switch (args[0] as Command) {
  case Command.ECHO:
    return echo(...args);
  case Command.HELP:
    return help(...args);
  case Command.CD:
    return await cd(...args);
  case Command.SU:
    return await su(...args);
  case Command.LS:
    return await ls(...args);
  case Command.USERADD:
    return await useradd(...args);
  case Command.TOUCH:
    return await touch(...args);
  case Command.MKDIR:
    return await mkdir(...args);
  case Command.UMASK:
    return await umask(...args);
  case Command.CP:
    return await cp(...args);
  case Command.MV:
    return await mv(...args);
  case Command.RM:
    return await rm(...args);
  case Command.CAT:
    return await cat(...args);
  case Command.ALIAS:
    return await alias(...args);
  default:
    return echo('echo', ' ', `Unknown command:\\u001b[31m ${args[0]}`);
  }
}

enum RedirectionMode {
  Output,
  Append,
}

function extractShellRedirection (...args: string[]): Result<{
  redirections: { mode: RedirectionMode; name: string }[];
  args: string[];
}, string[]> {
  const redirections = [];

  for (let i = args.length - 1; i > 0; --i) {
    const arg = args[i];
    if (['>', '>>'].includes(arg)) {
      const mode = arg === '>' ? RedirectionMode.Output : RedirectionMode.Append;
      const pathname = args[i + 1];
      if (pathname === undefined) return new Err([`Parse error: no pathname found after '${arg}'`]);
      redirections.unshift({ mode, name: pathname });
      args.splice(i, 2);
    }
  }
  return new Ok({ redirections, args });
}

async function redirectOutput (output: string[], { mode, name }: { mode: RedirectionMode, name: string }): Promise<string[]> {
  const aggOutput = output.join('\n') + '\n';
  let res;
  switch (mode) {
  case RedirectionMode.Append:
    res = await fileService.appendFileContent(name, aggOutput);
    break;
  case RedirectionMode.Output:
    res = await fileService.writeFileContent(name, aggOutput);
    break;
  }
  if (res.isOk()) return [];
  return [res.error()!.message];
}

async function resolveAlias (...args: string[]): Promise<string[]> {
  while (await aliasService.hasAlias(args[0])) {
    const resolvedCommand = parse((await aliasService.getAlias(args[0])).unwrap()).filter((arg) => arg.trim());
    args.splice(0, 1, ...resolvedCommand, ...args.slice(1));
  }
  return args;
}
