import { Err, Ok, type Diagnostic, type Result } from './types';

export interface UserMeta {
  name: string;
  userId: number;
  groupId: number;
  createdAt: Date;
}

const userMetaCache = new Map<number, unknown>();

export const userService = {
  async getMetaOfUser(id: number): Promise<Result<UserMeta, Diagnostic>> {
    if (!userMetaCache.has(id)) {
      const res = await $fetch('/api/users', {
        method: 'get',
        query: {
          id,
        },
        credentials: 'include',
      });
      userMetaCache.set(id, res);
    }
    const res = userMetaCache.get(id) as any;
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    const { ok: { data } } = res;
    return new Ok({ name: data.name, userId: data.userId, groupId: data.groupId, createdAt: data.createdAt });
  },
  async getHomeDirectory(id: number): Promise<Result<string, Diagnostic>> {
  },
  async switchUser(name: string, password: string | undefined): Promise<Result<UserMeta, Diagnostic>> {
    const res = await $fetch('/api/auth/login', {
      method: 'post',
      body: {
        name,
        password,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    const { ok: { data } } = res;
    const { switchUser } = useUserStore();
    switchUser(data.username);
    return new Ok({ name: data.username, userId: data.userId, groupId: data.groupId, createdAt: data.createdAt });
  },
  async addUser(name: string, password: string | undefined): Promise<Result<null, Diagnostic>> {
    const res = await $fetch('/api/auth/register', {
      method: 'post',
      body: {
        name,
        password,
      },
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    const { switchUser } = useUserStore();
    switchUser(name, password);
    return new Ok(null);

  }
};
