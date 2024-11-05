import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const umask: CommandFunc = async function(...args) {
  // discard `umask`
  args.shift();
  // discard first space
  args.shift();

  if (args.length === 0) {
    const { umask } = useUmaskStore();
    return [umaskToOct(umask.value)];
  }

  if (args.length > 1) {
    return [
      'Invalid use of umask. Run \'help umask\'',
    ];
  }

  const umask = formatArg(args[0]);
  if (umask.length !== 3 || !isOctDigit(umask[0]) || !isOctDigit(umask[1]) || !isOctDigit(umask[2])) {
    return ['Invalid umask'];
  }
  const { changeUmask } = useUmaskStore();
  changeUmask(umaskFromOct(umask as any));
  return [
    'Change umask successfully',
  ];
};

function isOctDigit(c: string): boolean {
  const n = Number.parseInt(c);
  return c.length === 1 && 0 <= n && n <= 7;
}

function umaskToOct(umask: string): string {
  const ownerRead = Number.parseInt(umask[3]);
  const ownerWrite = Number.parseInt(umask[4]);
  const ownerExecute = Number.parseInt(umask[5]);
  const ownerOct = ownerRead * 4 + ownerWrite * 2 + ownerExecute;
  const groupRead = Number.parseInt(umask[6]);
  const groupWrite = Number.parseInt(umask[7]);
  const groupExecute = Number.parseInt(umask[8]);
  const groupOct = groupRead * 4 + groupWrite * 2 + groupExecute;
  const otherRead = Number.parseInt(umask[9]);
  const otherWrite = Number.parseInt(umask[10]);
  const otherExecute = Number.parseInt(umask[11]);
  const otherOct = otherRead * 4 + otherWrite * 2 + otherExecute;
  return `${ownerOct}${groupOct}${otherOct}`;
}

function umaskFromOct(octs: string): string {
  const ownerOct = octs[0];
  const groupOct = octs[1];
  const otherOct = octs[2];
  return `000${ownerOct.toString(2).padStart(3, '0')}${groupOct.toString(2).padStart(3, '0')}${otherOct.toString(2).padStart(3, '0')}`;
}
