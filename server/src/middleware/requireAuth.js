import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');   // "Bearer abc..." → ["Bearer", "abc..."]

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);  // throws if fake or expired
    req.userId = payload.userId;
    next();   // token is good → continue to the route
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}
