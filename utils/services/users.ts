import { Err, Ok, type Diagnostic, type Result } from './types';

export interface UserMeta {
  name: string;
  userId: number;
  groupId: number;
  createdAt: Date;
}

const userMetaCache = new Map<number, unknown>();

export const userService = {
  async getMetaOfUser (id: number): Promise<Result<UserMeta, Diagnostic>> {
    try {
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
        return new Err({ message: res.error.message || 'Failed to fetch user metadata' });
      }
      const { ok: { data } } = res;
      return new Ok({
        name: data.name,
        userId: data.userId,
        groupId: data.groupId,
        createdAt: new Date(data.createdAt),
      });
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to fetch user metadata' });
    }
  },
  async switchUser (name: string, password: string | undefined): Promise<Result<UserMeta, Diagnostic>> {
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'post',
        body: {
          name,
          password,
        },
        credentials: 'include',
      });
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to switch user' });
      }
      const { ok: { data } } = res;
      const { switchUser } = useUserStore();
      switchUser(data.username);
      return new Ok({
        name: data.username,
        userId: data.userId,
        groupId: data.groupId,
        createdAt: new Date(data.createdAt),
      });
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to switch user' });
    }
  },
  async addUser (name: string, password: string | undefined): Promise<Result<null, Diagnostic>> {
    try {
      const res = await $fetch('/api/auth/register', {
        method: 'post',
        body: {
          name,
          password,
        },
        credentials: 'include',
      });
      if (res.error) {
        return new Err({ message: res.error.message || 'Failed to register user' });
      }
      const { switchUser } = useUserStore();
      switchUser(name);
      return new Ok(null);
    } catch (error) {
      return new Err({ message: error instanceof Error ? error.message : 'Failed to register user' });
    }
  },
};
