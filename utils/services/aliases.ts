import { Err, Ok, type Diagnostic, type Result } from './types';

let allAliases: { name: string; command: string }[] | undefined = undefined;

async function init () {
  try {
    const res = await $fetch('/api/aliases', { credentials: 'include' });
    if (res.ok && res.ok.data?.commands) {
      allAliases = res.ok.data.commands;
    } else {
      allAliases = [];
      return new Err({ message: res.error?.message || 'Failed to fetch aliases' });
    }
  } catch (error) {
    allAliases = [];
    return new Err({ message: 'Failed to fetch aliases' });
  }
}

export const aliasService = {
  async getAlias (name: string): Promise<Result<string, Diagnostic>> {
    if (!allAliases) await init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    if (alias === undefined) {
      return new Err({ message: 'Alias not found' });
    }
    return new Ok(alias.command);
  },
  async hasAlias (name: string): Promise<boolean> {
    if (!allAliases) await init();
    const alias = allAliases!.find(({ name: entryName }) => entryName === name);
    return alias !== undefined;
  },
  async setAlias (name: string, command: string): Promise<Result<null, Diagnostic>> {
    try {
      const res = await $fetch('/api/aliases', {
        method: 'post',
        body: {
          name,
          command,
        },
        credentials: 'include',
      });
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to set alias' });
      }
      if (!allAliases) await init();
      const alias = allAliases!.find(({ name: entryName }) => entryName === name);
      if (alias) {
        alias.command = command;
      } else {
        allAliases!.push({ name, command });
      }
      return new Ok(null);
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to set alias' });
    }
  },
  async deleteAlias (name: string): Promise<Result<null, Diagnostic>> {
    try {
      const res = await $fetch('/api/aliases', {
        method: 'delete',
        body: {
          name,
        },
        credentials: 'include',
      });
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to delete alias' });
      }
      if (!allAliases) await init();
      const index = allAliases!.findIndex(({ name: entryName }) => entryName === name);
      if (index !== -1) allAliases!.splice(index, 1);
      return new Ok(null);
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to delete alias' });
    }
  },
};
