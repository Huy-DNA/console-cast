import { aliasService } from '~/services';
import { stripQuotes } from '../utils';
import type { AsyncCommandFunc } from './types';

export const alias: AsyncCommandFunc = async function (...args) {
  // discard `alias`
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Invalid alias expression, expected: <alias>=<command>',
    ];
  }

  const aliasExpr = stripQuotes(args[0])!;
  const aliasTokens = aliasExpr.split('=');
  if (aliasTokens.length <= 1) {
    return [
      'Invalid alias expression, expected: <alias>=<command>',
    ];
  }
  const alias = stripQuotes(aliasTokens.shift()!.trim())!;
  const command = stripQuotes(aliasTokens.join('=').trim())!;
  const res = await aliasService.setAlias(alias, command);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
