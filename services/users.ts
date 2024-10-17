import type { Diagnostic, Result } from './types';

export interface UserMeta {
  name: string;
  userId: number;
  groupId: number;
  createdAt: Date;
}

export const userService = {
  async getMetaOfUser (id: number): Promise<Result<UserMeta, Diagnostic>> {
  },
  async getHomeDirectory (id: number): Promise<Result<string, Diagnostic>> {
  },
  async switchUser (name: string, password: string): Promise<Result<UserMeta, Diagnostic>> {
  },
};
