import { groupService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const groups: AsyncCommandFunc = async function (...args) {
  // discard `groups`
  args.shift();

  if (args.length > 1) {
    return [
      'Invalid use of groups. Run \'help groups\'',
    ];
  }

  const { username } = useUserStore();
  const owner = formatArg(args[0]) || username.value;
  const res = await groupService.getGroupByOwner(owner);
  if (res.isOk()) {
    const groups = res.unwrap();
    return groups.length === 0 ? [
      'No groups found. Maybe you mis-spelled the owner?'
    ] : [
      groups.map(({ name }) => name).join(' '),
    ];
  }
  return [
    res.error()!.message,
  ];
};
