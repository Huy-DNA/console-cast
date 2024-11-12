import { Err, Ok, type Diagnostic, type Result } from './types';

export const aliasService = {
  async getAlias (name: string): Promise<Result<string, Diagnostic>> {
    const res = await $fetch('/api/aliases', {
      method: 'get',
      query: { name },
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(res.ok.data.command);
  },
};
