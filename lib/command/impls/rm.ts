import { uniq } from 'lodash-es';
import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const rm: AsyncCommandFunc = async function(...args) {
  // discard `rm`
  args.shift();
  // discard first space
  args.shift();

  const { cwd } = useCwdStore();
  const filenames = uniq(args.filter((arg) => arg.trim()).map((arg) => cwd.value.resolve(formatArg(arg)!).toString()));

  const lines = [];
  for (const filename of filenames) {
    const res = await fileService.removeFile(filename);
    if (!res.isOk()) {
      lines.push(`${filename}: ${res.error()!.message}`);
    }
  }
  return lines;
};
