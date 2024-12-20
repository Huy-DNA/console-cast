import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';
import { userService } from '~/services/users';

export const useradd: AsyncCommandFunc = async function (...args) {
  // discard `useradd`
  args.shift();

  let username;
  let password;

  while (args.length) {
    const opt = args.shift();
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
