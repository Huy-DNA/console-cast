import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  // const jwtToken = getCookie(event, ' jwt');
  const headers = event.node.req.rawHeaders;
  const idx = headers.findIndex(val => val === 'cookie') + 1;
  const cookies = headers[idx].split('; ');
  const jwtToken = cookies.find(val => val.startsWith('jwt='))?.slice(4);

  if (!jwtToken) {
    event.context.auth = null;
    return;
  }

  const { JWT_KEY } = useRuntimeConfig();
  try {
    const { username, userId, groupId } = jwt.decode(jwtToken, JWT_KEY) as any;
    event.context.auth = { username, userId, groupId };
    return;
  } catch {
    event.context.auth = null;
    return;
  }
});
