import { Err, Ok, type Diagnostic, type Result } from './types';

export interface GroupMeta {
  name: string;
  id: number;
  createdAt: Date;
}

const groupMetaCache = new Map<number, unknown>();

export const groupService = {
  async getMetaOfGroup (id: number): Promise<Result<GroupMeta, Diagnostic>> {
    try {
      if (!groupMetaCache.has(id)) {
        const res = await $fetch('/api/groups', {
          method: 'get',
          query: {
            id,
          },
          credentials: 'include',
        });
        groupMetaCache.set(id, res);
      }
      const res = groupMetaCache.get(id) as any;
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to fetch group metadata' });
      }
      const { ok: { data } } = res;
      return new Ok({ name: data.name, id: data.id, createdAt: new Date(data.createdAt) });
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to fetch group metadata' });
    }
  },
  async getGroupByOwner (owner: string): Promise<Result<GroupMeta[], Diagnostic>> {
    try {
      const res = await $fetch('/api/groups', {
        method: 'get',
        query: {
          owner,
        },
        credentials: 'include',
      });
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to fetch groups by owner' });
      }
      const { ok: { data } } = res;
      return new Ok(data.map((item: any) => ({
        name: item.name,
        id: item.id,
        createdAt: new Date(item.createdAt),
      })));
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to fetch groups by owner' });
    }
  },
};
