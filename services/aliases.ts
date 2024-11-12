import { AliasGetErrorCode } from '~/lib';
import { Err, Ok, type Diagnostic, type Result } from './types';

const allAliases: { name: string; command: string }[] = (await $fetch('/api/aliases')).ok.data.commands;

export const aliasService = {
  getAlias (name: string): Result<string, Diagnostic> {
    const alias = allAliases.find(({ name: entryName }) => entryName === name);
    if (alias === undefined) {
      return new Err({ code: AliasGetErrorCode.ALIAS_NOT_FOUND, message: 'Alias not found' });
    }
    return new Ok(alias.command);
  },
  hasAlias (name: string): boolean {
    const alias = allAliases.find(({ name: entryName }) => entryName === name);
    return alias !== undefined;
  }
};
