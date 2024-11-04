import { formatArg } from '../utils';
import type { CommandFunc } from './types';
import { userService } from '~/services/users';

export const useradd: CommandFunc = async function(...args) {
  // discard `useradd`
  args.shift();
  // discard first space
  args.shift();

  let username;
  let password;

  while (args.length) {
    const opt = args.shift();
    args.shift();
    if (args.length === 0) return ['Invalid use of useradd. Run \'help useradd\''];
    switch (opt) {
    case '-u':
      username = formatArg(args.shift()!);
      break;
    case '-p':
      password = formatArg(args.shift()!);
      break;
    default:
      return ['Invalid use of useradd. Run \'help useradd\''];
    }
    args.shift();
  }

  if (username === undefined) {
    return ['Invalid use of useradd. Run \'help useradd\''];
  }

  const res = await userService.addUser(username, password);
  if (res.isOk()) {
    return [`Added and logged in successfully as ${username}.`];
  }
  return [
    res.error()!.message,
  ];
};
