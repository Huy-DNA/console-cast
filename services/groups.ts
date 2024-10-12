import type { Diagnostic, Result } from './types';

export interface GroupMeta {
  name: string;
  groupId: number;
  createdAt: Date;
}

export const groupService = {
  async getMetaOfGroup (id: number): Promise<Result<GroupMeta, Diagnostic>> {
  },
};
