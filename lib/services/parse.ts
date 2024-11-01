export function parse (command: string): string[] {
  const tokens = [];
  while (true) {
    const tokenRes = getNextToken(command);
    if (tokenRes === undefined) {
      break;
    }
    const { token, remaining } = tokenRes;
    tokens.push(token);
    command = remaining;
  }
  return tokens;
}

function getNextToken (command: string): { token: string, remaining: string } | undefined {
  if (command.length === 0) {
    return undefined;
  }
  if (command[0] === ' ') {
    let nonspaceIndex = command.search(/[^\s]/);
    if (nonspaceIndex === -1) nonspaceIndex = command.length;
    return { token: command.slice(0, nonspaceIndex), remaining: command.slice(nonspaceIndex) };
  }

  let token = '';
  let isInDoubleQuote = false;
  let isInSingleQuote = false;
  for (let i = 0; i < command.length; ++i) {
    const char = command[i];
    switch (char) {
    case '"': {
      token += '"';
      if (isInDoubleQuote) {
        isInDoubleQuote = false;
      } else if (!isInSingleQuote) {
        isInDoubleQuote = true;
      }
      break;
    }
    case '\'': {
      token += '\'';
      if (isInSingleQuote) {
        isInSingleQuote = false;
      } else if (!isInDoubleQuote) {
        isInSingleQuote = true;
      }
      break;
    }
    case ' ': {
      if (isInDoubleQuote || isInSingleQuote) {
        token += ' ';
      } else {
        return { token, remaining: command.slice(i) };
      }
      break;
    }
    case '\\': {
      token += '\\';
      i += 1;
      const nextChar = command[i];
      switch (nextChar) {
      case '\'':
        token += '\'';
        break;
      case '"':
        token += '"';
        break;
      default:
        token += nextChar;
      }
      break;
    }
    default:
      token += char;
    }
  }
  return { token, remaining: '' };
}
