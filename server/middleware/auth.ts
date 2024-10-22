import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const jwtToken = getCookie(event, 'jwt');
  if (!jwtToken) {
    event.context.auth = null;
    return;
  }

  const { JWT_KEY } = useRuntimeConfig();
  try {
    const { username, userid, groupid } = jwt.decode(jwtToken, JWT_KEY) as any;
    event.context.auth = { username, userid, groupid };
    return;
  } catch {
    event.context.auth = null;
    return;
  }
});
