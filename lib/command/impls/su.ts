import { formatArg } from '../utils';
import type { CommandFunc } from './types';
import { userService } from '~/services/users';

export const su: CommandFunc = async function(...args) {
  // discard `su`
  args.shift();
  // discard first space
  args.shift();

  let username;
  let password;

  while (args.length) {
    const opt = args.shift();
    args.shift();
    if (args.length === 0) return ['Invalid use of su. Run \'help su\''];
    switch (opt) {
    case '-u':
      username = formatArg(args.shift()!);
      break;
    case '-p':
      password = formatArg(args.shift()!);
      break;
    default:
      return ['Invalid use of su. Run \'help su\''];
    }
    args.shift();
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
