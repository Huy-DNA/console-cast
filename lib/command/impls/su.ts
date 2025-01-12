import { stripQuotes } from '../utils';
import type { AsyncCommandFunc } from './types';
import { userService } from '~/services/users';

export const su: AsyncCommandFunc = async function (...args) {
  // discard `su`
  args.shift();

  let username;
  let password;

  while (args.length) {
    const opt = args.shift();
    if (args.length === 0) return ['Invalid use of su. Run \'help su\''];
    switch (opt) {
    case '-u':
      username = stripQuotes(args.shift()!);
      break;
    case '-p':
      password = stripQuotes(args.shift()!);
      break;
    default:
      return ['Invalid use of su. Run \'help su\''];
    }
  }

  if (username === undefined) {
    return ['Invalid use of su. Run \'help su\''];
  }

  const res = await userService.switchUser(username, password);
  if (res.isOk()) {
    return [`Login successfully as ${username}.`];
  }
  return [
    res.error()!.message,
  ];
};
