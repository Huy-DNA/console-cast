import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const touch: CommandFunc = async function(...args) {
  // discard `touch`
  args.shift();
  // discard first space
  args.shift();

  if (args.length > 1) {
    return ['Invalid use of touch. Run \'help touch\''];
  }

  const filename = formatArg(args[0])!;
  
  const { umask } = useUmaskStore();
  const res = await fileService.createFile(filename, '', umask.value);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
