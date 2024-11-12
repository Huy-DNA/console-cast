import { AliasGetErrorCode } from '~/lib';
import { Err, Ok, type Diagnostic, type Result } from './types';

let allAliases: { name: string; command: string }[] | undefined = undefined;
async function init () {
  allAliases = (await $fetch('/api/aliases')).ok.data.commands;
}

export const aliasService = {
  async getAlias (name: string): Promise<Result<string, Diagnostic>> {
    if (!allAliases) await init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    if (alias === undefined) {
      return new Err({ code: AliasGetErrorCode.ALIAS_NOT_FOUND, message: 'Alias not found' });
    }
    return new Ok(alias.command);
  },
  async hasAlias (name: string): Promise<boolean> {
    if (!allAliases) await init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    return alias !== undefined;
  },
  async setAlias (name: string, command: string): Promise<Result<null, Diagnostic>> {
    const res = await $fetch('/api/aliases', {
      method: 'post',
      body: {
        name,
        command,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    if (!allAliases) await init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    if (alias) {
      alias.command = command;
    } else {
      allAliases!.push({ name, command });
    }
    return new Ok(null);
  },
  async deleteAlias (name: string): Promise<Result<null, Diagnostic>> {
    const res = await $fetch('/api/aliases', {
      method: 'delete',
      body: {
        name,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    if (!allAliases) await init();
    const index = allAliases!.findIndex(({ name: entryName }) => entryName === name);
    if (index) allAliases!.splice(index, 1);
    return new Ok(null);
  },
};
