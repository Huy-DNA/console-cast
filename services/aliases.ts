import { AliasGetErrorCode } from '~/lib';
import { Err, Ok, type Diagnostic, type Result } from './types';

let allAliases: { name: string; command: string }[] | undefined = undefined;

export const aliasService = {
  async init () {
    allAliases = (await $fetch('/api/aliases')).ok.data.commands;
  },
  async getAlias(name: string): Promise<Result<string, Diagnostic>> {
    if (!allAliases) await aliasService.init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    if (alias === undefined) {
      return new Err({ code: AliasGetErrorCode.ALIAS_NOT_FOUND, message: 'Alias not found' });
    }
    return new Ok(alias.command);
  },
  async hasAlias(name: string): Promise<boolean> {
    if (!allAliases) await aliasService.init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    return alias !== undefined;
  }
};
