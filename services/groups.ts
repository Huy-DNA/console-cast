import { Err, Ok, type Diagnostic, type Result } from './types';

export interface GroupMeta {
  name: string;
  id: number;
  createdAt: Date;
}

const groupMetaCache = new Map<number, unknown>();

export const groupService = {
  async getMetaOfGroup (id: number): Promise<Result<GroupMeta, Diagnostic>> {
    if (!groupMetaCache.has(id)) {
      const res = await $fetch('/api/groups', {
        method: 'get',
        query: {
          id,
        },
      });
      groupMetaCache.set(id, res);
    }
    const res = groupMetaCache.get(id) as any;
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    const { ok: { data } } = res;
    return new Ok({ name: data.name, id: data.id, createdAt: data.createdAt });
  },
};
